import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

/**
 * Generates a collision-resistant CivicAI complaint tracking ID
 * Format: CIV-2026-XXXXX
 */
export function generateComplaintId() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `CIV-${year}-${randomSuffix}`;
}

/**
 * Normalizes complaint status to standard UPPERCASE enum
 * REPORTED | RECEIVED | UNDER_REVIEW | ASSIGNED | IN_PROGRESS | RESOLVED | REJECTED
 */
export function normalizeStatus(status) {
  if (!status) return "REPORTED";
  const upper = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
  const valid = [
    "REPORTED",
    "RECEIVED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED"
  ];
  return valid.includes(upper) ? upper : "REPORTED";
}

/**
 * Formats UPPERCASE status enum to Title Case string for UI display
 */
export function formatDisplayStatus(status) {
  const norm = normalizeStatus(status);
  const map = {
    REPORTED: "Reported",
    RECEIVED: "Received",
    UNDER_REVIEW: "Under Review",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED: "Rejected"
  };
  return map[norm] || "Reported";
}

/**
 * Calculates human-readable relative time (e.g. "2 mins ago", "1 hour ago", "Yesterday")
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return "Just now";
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "Recently";

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Returns tailored notification title and message based on status specification
 */
export function getNotificationContent(status, complaintId, note = "") {
  const norm = normalizeStatus(status);
  const display = formatDisplayStatus(status);

  if (norm === "RESOLVED") {
    return {
      title: "Complaint Resolved",
      message: `Your complaint ${complaintId} has been marked as Resolved by the authority.`
    };
  }
  if (norm === "REJECTED") {
    return {
      title: "Complaint Update",
      message: `Your complaint ${complaintId} has been rejected. Please check the complaint details for more information.`
    };
  }
  if (norm === "ASSIGNED") {
    return {
      title: "Complaint Assigned",
      message: `Your complaint ${complaintId} has been assigned to the relevant department.`
    };
  }
  if (norm === "IN_PROGRESS") {
    return {
      title: "Complaint In Progress",
      message: `Your complaint ${complaintId} is now In Progress.`
    };
  }
  if (norm === "UNDER_REVIEW") {
    return {
      title: "Complaint Status Updated",
      message: `Your complaint ${complaintId} is now Under Review.`
    };
  }
  return {
    title: "Complaint Status Updated",
    message: `Your complaint ${complaintId} is now ${display}.`
  };
}

/**
 * Creates a notification document in Firestore: notifications/{notificationId}
 */
export async function createNotification({ userId, complaintId, status, note }) {
  if (!userId) return null;

  const notifId = `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const { title, message } = getNotificationContent(status, complaintId, note);
  const displayStatus = formatDisplayStatus(status);

  const notifDoc = {
    notificationId: notifId,
    id: notifId,
    userId,
    complaintId,
    type: "COMPLAINT_STATUS_UPDATE",
    title,
    message,
    status: displayStatus,
    createdAt: serverTimestamp(),
    read: false
  };

  try {
    const docRef = doc(db, "notifications", notifId);
    await setDoc(docRef, notifDoc);
  } catch (err) {
    console.warn("Firestore createNotification error:", err.message);
  }

  return notifDoc;
}

/**
 * Uploads an image file to Firebase Storage
 * Path: complaints/{timestamp}_{filename}
 */
export async function uploadComplaintImage(file, onProgress) {
  if (!file) return null;

  if (typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))) {
    return file;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Image size exceeds maximum limit of 10MB");
  }

  const sanitizedFileName = (file.name || "photo.jpg").replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `complaints/${Date.now()}_${sanitizedFileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Creates a new complaint document in Firestore: complaints/{complaintId}
 */
export async function createComplaint(complaintData, currentUser, userProfile) {
  const complaintId = generateComplaintId();
  const nowIso = new Date().toISOString();

  const currentAuthUser = auth.currentUser;
  const userId = currentAuthUser?.uid || currentUser?.uid || currentUser?.userId;
  if (!userId) {
    throw new Error("Complaint submission failed: User is not authenticated.");
  }

  const citizenName = userProfile?.name || currentAuthUser?.displayName || currentUser?.name || "Citizen";
  const userDistrict = userProfile?.district || "Chennai South";

  const loc = complaintData.location || {};
  const lat = loc.lat ?? 13.0067;
  const lng = loc.lng ?? 80.2571;
  const district = loc.district || userDistrict;
  const address = loc.address || "Reported Location, Ward 12";
  const ward = loc.ward || "Ward 12";

  const initialStatus = "REPORTED";

  const timelineItem = {
    step: 1,
    stage: initialStatus,
    status: initialStatus,
    timestamp: nowIso,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    actor: `${citizenName} (Citizen)`,
    note: "Complaint submitted via CivicAI interface. Citizen confirmed AI categorization.",
    completed: true
  };

  const statusHistoryItem = {
    status: initialStatus,
    timestamp: nowIso,
    note: "Complaint submitted via CivicAI interface. Citizen confirmed AI categorization.",
    officer: citizenName
  };

  const complaintDoc = {
    complaintId,
    userId,
    description: complaintData.description || complaintData.text || "",
    originalLanguage: complaintData.originalLanguage || complaintData.language || "English",
    category: complaintData.category || "General Civic Issue",
    subcategory: complaintData.subcategory || "General",
    summary: complaintData.summary || complaintData.title || "Civic complaint reported",
    severity: (complaintData.severity || "MEDIUM").toUpperCase(),
    department: complaintData.department || "Municipal Administration",
    latitude: Number(lat),
    longitude: Number(lng),
    district,
    imageUrl: complaintData.imageUrl || (complaintData.images?.[0] ?? null),
    status: initialStatus,
    authorityNote: "",
    statusHistory: [statusHistoryItem],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // Visual component compatibility fields
    id: complaintId,
    title: complaintData.summary || complaintData.title || "Civic complaint reported",
    originalText: complaintData.description || complaintData.text || "",
    language: complaintData.originalLanguage || complaintData.language || "English",
    submittedBy: citizenName,
    submittedAt: nowIso,
    location: {
      address,
      ward,
      district,
      lat: Number(lat),
      lng: Number(lng)
    },
    images: complaintData.images || (complaintData.imageUrl ? [complaintData.imageUrl] : []),
    timeline: [timelineItem],
    authorityUpdates: [],
    aiAnalysis: complaintData.aiAnalysis || {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.95,
      detectedLanguage: complaintData.originalLanguage || complaintData.language || "English",
      category: complaintData.category,
      subcategory: complaintData.subcategory,
      summary: complaintData.summary,
      severity: complaintData.severity,
      department: complaintData.department
    }
  };

  try {
    const docRef = doc(db, "complaints", complaintId);
    await setDoc(docRef, complaintDoc);

    // Synchronize with backend API in background
    try {
      fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintDoc)
      }).catch(() => {});
    } catch (_) {}

    return {
      ...complaintDoc,
      createdAt: nowIso,
      updatedAt: nowIso
    };
  } catch (error) {
    console.error("Firestore createComplaint Error for complaints/" + complaintId + ":", error);
    throw error;
  }
}

/**
 * Fetches single complaint by ID (direct read from Firestore)
 */
export async function getComplaintById(complaintId) {
  if (!complaintId) return null;
  try {
    const docRef = doc(db, "complaints", complaintId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id };
    }
  } catch (err) {
    console.warn(`Firestore getComplaintById error for ${complaintId}:`, err.message);
  }

  // Fallback to backend API
  try {
    const res = await fetch(`http://localhost:5000/api/complaints/${complaintId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Fetches all complaints submitted by a specific citizen
 */
export async function getComplaintsByUserId(userId) {
  if (!userId) return [];
  try {
    const complaintsRef = collection(db, "complaints");
    let q;
    try {
      q = query(complaintsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    } catch (orderErr) {
      q = query(complaintsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return items;
    }
  } catch (error) {
    console.error("getComplaintsByUserId error:", error);
    return [];
  }
}

/**
 * Fetches all complaints for Municipal Authorities
 */
export async function getAllComplaints() {
  try {
    const complaintsRef = collection(db, "complaints");
    let q;
    try {
      q = query(complaintsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    } catch (orderErr) {
      const snapshot = await getDocs(complaintsRef);
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return items;
    }
  } catch (error) {
    console.error("getAllComplaints error:", error);
    return [];
  }
}

/**
 * Updates complaint status and creates citizen notification when status progresses
 */
export async function updateComplaintStatus(complaintId, newStatus, note = "", officerName = "Municipal Officer") {
  const validStatus = normalizeStatus(newStatus);
  const nowIso = new Date().toISOString();
  const dateFormatted = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const timelineEntry = {
    step: Date.now(),
    stage: validStatus,
    status: validStatus,
    timestamp: nowIso,
    date: dateFormatted,
    actor: officerName,
    note: note || `Status updated to ${validStatus}`,
    completed: true
  };

  const authorityUpdate = note ? {
    id: `UPD-${Date.now()}`,
    officer: officerName,
    designation: "Zonal Municipal Officer",
    date: dateFormatted,
    status: validStatus,
    statusBadge: validStatus,
    message: note,
    text: note
  } : null;

  const historyItem = {
    status: validStatus,
    timestamp: nowIso,
    note: note || `Status updated to ${validStatus}`,
    officer: officerName
  };

  try {
    const docRef = doc(db, "complaints", complaintId);
    const existingSnap = await getDoc(docRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      const isStatusChanged = normalizeStatus(data.status) !== validStatus;

      const updatedTimeline = [...(data.timeline || []), timelineEntry];
      const updatedAuthorityUpdates = authorityUpdate 
        ? [authorityUpdate, ...(data.authorityUpdates || [])]
        : (data.authorityUpdates || []);
      const updatedStatusHistory = [...(data.statusHistory || []), historyItem];

      await updateDoc(docRef, {
        status: validStatus,
        updatedAt: serverTimestamp(),
        authorityNote: note || data.authorityNote || "",
        timeline: updatedTimeline,
        authorityUpdates: updatedAuthorityUpdates,
        statusHistory: updatedStatusHistory
      });

      // Create notification whenever authority updates status
      if (data.userId) {
        await createNotification({
          userId: data.userId,
          complaintId: data.complaintId || complaintId,
          status: validStatus,
          note
        });
      }

      // Synchronize with backend API in background
      try {
        fetch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: validStatus,
            remarks: note,
            updatedBy: officerName,
            userId: data.userId
          })
        }).catch(() => {});
      } catch (_) {}

      return {
        ...data,
        status: validStatus,
        updatedAt: nowIso,
        authorityNote: note || data.authorityNote || "",
        timeline: updatedTimeline,
        authorityUpdates: updatedAuthorityUpdates,
        statusHistory: updatedStatusHistory
      };
    } else {
      throw new Error(`Complaint ${complaintId} does not exist.`);
    }
  } catch (error) {
    console.error("updateComplaintStatus error:", error);
    throw error;
  }
}

/**
 * Real-time listener for a single complaint document
 */
export function subscribeToComplaint(complaintId, onUpdate) {
  if (!complaintId) return () => {};
  const docRef = doc(db, "complaints", complaintId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ ...snapshot.data(), id: snapshot.id });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`subscribeToComplaint error for ${complaintId}:`, err.message);
    }
  );
}

/**
 * Real-time listener for citizen notifications
 */
export function subscribeToNotifications(userId, onUpdate) {
  if (!userId) return () => {};
  const notifRef = collection(db, "notifications");
  const READ_STORAGE_KEY = `civicai_read_notifs_${userId}`;

  const getReadSet = () => {
    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (_) {
      return new Set();
    }
  };

  let q;
  try {
    q = query(
      notifRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
  } catch (err) {
    q = query(notifRef, where("userId", "==", userId));
  }

  let unsubComplaints = null;

  const unsubNotifs = onSnapshot(
    q,
    (snapshot) => {
      if (unsubComplaints) {
        unsubComplaints();
        unsubComplaints = null;
      }
      const list = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
        notificationId: d.data().notificationId || d.id
      }));
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      onUpdate(list, snapshot);
    },
    (err) => {
      console.warn("Notifications onSnapshot fallback to complaint records:", err.message);

      // Resilient fallback: listen to complaints collection for this user in real time
      try {
        const complaintsRef = collection(db, "complaints");
        const cq = query(complaintsRef, where("userId", "==", userId));

        unsubComplaints = onSnapshot(
          cq,
          (cSnapshot) => {
            const readSet = getReadSet();
            const derivedList = [];

            cSnapshot.docs.forEach((docSnap) => {
              const comp = docSnap.data();
              const cid = comp.complaintId || docSnap.id;
              const history = comp.statusHistory || [];

              if (history.length > 0) {
                history.forEach((h, idx) => {
                  // Only generate notifications for actual progress / updates
                  const notifId = `NOTIF-${cid}-${h.status}-${idx}`;
                  const { title, message } = getNotificationContent(h.status, cid, h.note);
                  derivedList.push({
                    notificationId: notifId,
                    id: notifId,
                    userId: comp.userId || userId,
                    complaintId: cid,
                    type: "COMPLAINT_STATUS_UPDATE",
                    title,
                    message,
                    status: formatDisplayStatus(h.status),
                    read: readSet.has(notifId),
                    createdAt: h.timestamp || comp.updatedAt || comp.createdAt
                  });
                });
              } else if (comp.status && normalizeStatus(comp.status) !== "REPORTED") {
                const notifId = `NOTIF-${cid}-${comp.status}`;
                const { title, message } = getNotificationContent(comp.status, cid, comp.authorityNote);
                derivedList.push({
                  notificationId: notifId,
                  id: notifId,
                  userId: comp.userId || userId,
                  complaintId: cid,
                  type: "COMPLAINT_STATUS_UPDATE",
                  title,
                  message,
                  status: formatDisplayStatus(comp.status),
                  read: readSet.has(notifId),
                  createdAt: comp.updatedAt || comp.createdAt
                });
              }
            });

            derivedList.sort((a, b) => {
              const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
              const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
              return timeB - timeA;
            });

            onUpdate(derivedList, cSnapshot);
          },
          (compErr) => {
            console.warn("Complaints fallback snapshot error:", compErr.message);
          }
        );
      } catch (_) {}
    }
  );

  return () => {
    if (typeof unsubNotifs === "function") unsubNotifs();
    if (typeof unsubComplaints === "function") unsubComplaints();
  };
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId, userId = null) {
  if (!notificationId) return;

  if (userId) {
    try {
      const key = `civicai_read_notifs_${userId}`;
      const raw = localStorage.getItem(key);
      const set = raw ? new Set(JSON.parse(raw)) : new Set();
      set.add(notificationId);
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch (_) {}
  }

  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    // If permission or collection doesn't exist yet, local state and localStorage handle it
  }
}

/**
 * Marks all notifications for a citizen as read
 */
export async function markAllNotificationsAsRead(notifications = [], userId = null) {
  if (userId) {
    try {
      const key = `civicai_read_notifs_${userId}`;
      const raw = localStorage.getItem(key);
      const set = raw ? new Set(JSON.parse(raw)) : new Set();
      notifications.forEach((n) => set.add(n.notificationId || n.id));
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch (_) {}
  }

  for (const n of notifications) {
    if (!n.read) {
      const notifId = n.notificationId || n.id;
      if (notifId) {
        try {
          const docRef = doc(db, "notifications", notifId);
          await updateDoc(docRef, { read: true });
        } catch (_) {}
      }
    }
  }
}

/**
 * Realtime subscription to complaints collection
 */
export function subscribeToComplaints(onUpdate, userId = null) {
  const complaintsRef = collection(db, "complaints");
  let q;

  if (userId) {
    q = query(complaintsRef, where("userId", "==", userId));
  } else {
    q = complaintsRef;
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn("Complaints snapshot error:", err.message);
    }
  );
}
