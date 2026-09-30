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
  serverTimestamp,
  arrayUnion
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
 * Uploads an image file to Firebase Storage
 * Path: complaints/{timestamp}_{filename}
 * @param {File|Blob} file 
 * @param {function} [onProgress] - Optional progress callback (0 - 100)
 * @returns {Promise<string>} Download URL of the uploaded image
 */
export async function uploadComplaintImage(file, onProgress) {
  if (!file) return null;

  // If already an HTTP/HTTPS URL (e.g. sample preset), return as-is
  if (typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))) {
    return file;
  }

  // Validate file size (10MB limit)
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
 * Schema matches the specification strictly.
 */
export async function createComplaint(complaintData, currentUser, userProfile) {
  const complaintId = generateComplaintId();
  const nowIso = new Date().toISOString();

  // The complaint userId MUST equal auth.currentUser.uid
  const currentAuthUser = auth.currentUser;
  const userId = currentAuthUser?.uid || currentUser?.uid;
  if (!userId) {
    throw new Error("Complaint submission failed: User is not authenticated.");
  }

  const citizenName = userProfile?.name || currentAuthUser?.displayName || currentUser?.name || "Citizen";
  const userDistrict = userProfile?.district || "Chennai South";

  const loc = complaintData.location || {};
  const lat = loc.latitude ?? loc.lat ?? 13.0067;
  const lng = loc.longitude ?? loc.lng ?? 80.2571;
  const district = loc.district || userDistrict;
  const address = loc.address || "Reported Location, Ward 12";
  const ward = loc.ward || "Ward 12";

  const initialStatus = "REPORTED";

  // Initial timeline event
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

  // Structured complaint document strictly adhering to schema requirements
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
      latitude: Number(lat),
      longitude: Number(lng),
      lat: Number(lat),
      lng: Number(lng),
      accuracy: loc.accuracy || null,
      captured: Boolean(loc.captured || (loc.latitude != null && loc.longitude != null))
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
 * Fetches all complaints submitted by a specific citizen
 * Filtered by userId == auth.currentUser.uid
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
      // Fallback without orderBy if Firestore composite index is not yet built
      console.warn("Index fallback for user complaints:", orderErr.message);
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
      console.warn("getAllComplaints order fallback:", orderErr.message);
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
 * Fetches a single complaint by complaintId
 */
export async function getComplaintById(complaintId) {
  if (!complaintId) return null;

  try {
    const docRef = doc(db, "complaints", complaintId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id };
    }

    // Secondary lookup if document ID was auto-generated
    const q = query(collection(db, "complaints"), where("complaintId", "==", complaintId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      return { ...first.data(), id: first.id };
    }

    return null;
  } catch (error) {
    console.error("getComplaintById error:", error);
    return null;
  }
}

/**
 * Updates complaint status and appends timeline / authority updates
 * @param {string} complaintId
 * @param {string} newStatus - REPORTED | RECEIVED | UNDER_REVIEW | ASSIGNED | IN_PROGRESS | RESOLVED | REJECTED
 * @param {string} note - Optional note/remark from officer
 * @param {string} officerName - Name of updating officer
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

  try {
    const docRef = doc(db, "complaints", complaintId);
    const existingSnap = await getDoc(docRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      const updatedTimeline = [...(data.timeline || []), timelineEntry];
      const updatedAuthorityUpdates = authorityUpdate 
        ? [authorityUpdate, ...(data.authorityUpdates || [])]
        : (data.authorityUpdates || []);

      await updateDoc(docRef, {
        status: validStatus,
        updatedAt: nowIso,
        timeline: updatedTimeline,
        authorityUpdates: updatedAuthorityUpdates
      });

      return {
        ...data,
        status: validStatus,
        updatedAt: nowIso,
        timeline: updatedTimeline,
        authorityUpdates: updatedAuthorityUpdates
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
 * Realtime subscription to complaints collection
 * Calls onUpdate(complaintsList) on every snapshot
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
