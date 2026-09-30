import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

let db = null;
let isFirestoreAvailable = false;

// In-memory persistent cache for fallback when Google service account credentials
// are not locally mounted or when developing offline
const memoryComplaints = new Map();

// Seed initial realistic complaints matching the Chennai municipality context
const SEED_COMPLAINTS = [
  {
    complaintId: "CIV-2026-10492",
    id: "CIV-2026-10492",
    userId: "cit_01_arun",
    title: "Drinking water supply disrupted for five consecutive days",
    description: "குடிநீர் ஐந்து நாட்களாக வரவில்லை. எங்கள் தெருவில் உள்ள 40 குடும்பங்கள் கடும் அவதிக்குள்ளாகியுள்ளன.",
    summary: "Drinking water supply cut off for 5 days affecting 40 households.",
    category: "Water Supply",
    subcategory: "Drinking Water Supply",
    severity: "HIGH",
    department: "Water Supply & Sewerage Board",
    status: "UNDER_REVIEW",
    originalLanguage: "Tamil",
    language: "Tamil",
    latitude: 13.0336,
    longitude: 80.2687,
    district: "Chennai South",
    location: {
      address: "South Mada Street, Mylapore",
      ward: "WARD-12",
      district: "Chennai South",
      lat: 13.0336,
      lng: 80.2687
    },
    imageUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    submittedBy: "Arun Kumar",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    timeline: [
      {
        step: 1,
        stage: "REPORTED",
        status: "REPORTED",
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        actor: "Arun Kumar (Citizen)",
        note: "Complaint submitted via CivicAI interface. Citizen confirmed AI categorization.",
        completed: true
      },
      {
        step: 2,
        stage: "UNDER_REVIEW",
        status: "UNDER_REVIEW",
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        actor: "Superintending Engineer, Zone 9",
        note: "Pipeline valve pressure check initiated.",
        completed: true
      }
    ],
    authorityUpdates: [
      {
        id: "auth_upd_1",
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        author: "Superintending Engineer, Zone 9",
        status: "UNDER_REVIEW",
        remarks: "Pipeline valve pressure check initiated."
      }
    ]
  },
  {
    complaintId: "CIV-2026-10493",
    id: "CIV-2026-10493",
    userId: "cit_02_priya",
    title: "Deep pothole causing accidents near school intersection",
    description: "Dangerous pothole on Gandhi Road near school crossing. Two-wheelers are slipping daily.",
    summary: "Hazardous crater near school junction creating acute accident vulnerability.",
    category: "Roads & Transport",
    subcategory: "Potholes & Road Damage",
    severity: "CRITICAL",
    department: "Roads & Infrastructure Department",
    status: "ASSIGNED",
    originalLanguage: "English",
    language: "English",
    latitude: 12.9815,
    longitude: 80.2180,
    district: "Chennai South",
    location: {
      address: "Gandhi Road Crossing, Velachery",
      ward: "WARD-18",
      district: "Chennai South",
      lat: 12.9815,
      lng: 80.2180
    },
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    submittedBy: "Priya S.",
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    timeline: [
      {
        step: 1,
        stage: "REPORTED",
        status: "REPORTED",
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        actor: "Priya S. (Citizen)",
        note: "AI categorized severity as Critical due to proximity to school.",
        completed: true
      },
      {
        step: 2,
        stage: "ASSIGNED",
        status: "ASSIGNED",
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        actor: "Zonal Officer, Zone 14",
        note: "Assigned to PWD Road Maintenance Crew #4 for urgent asphalt patching.",
        completed: true
      }
    ],
    authorityUpdates: [
      {
        id: "auth_upd_2",
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        author: "Zonal Officer, Zone 14",
        status: "ASSIGNED",
        remarks: "Assigned to PWD Road Maintenance Crew #4 for urgent asphalt patching."
      }
    ]
  },
  {
    complaintId: "CIV-2026-10494",
    id: "CIV-2026-10494",
    userId: "cit_03_karthik",
    title: "Streetlights not working on residential street for past week",
    description: "தெருவிளக்குகள் எரியவில்லை. இரவு நேரத்தில் பெண்கள், முதியவர்கள் நடக்க பயப்படுகிறார்கள்.",
    summary: "Consecutive streetlights non-operational causing safety concerns at night.",
    category: "Street Lights",
    subcategory: "Streetlight Non-Functional",
    severity: "MEDIUM",
    department: "Electrical & Public Lighting",
    status: "IN_PROGRESS",
    originalLanguage: "Tamil",
    language: "Tamil",
    latitude: 13.0418,
    longitude: 80.2341,
    district: "Chennai Central",
    location: {
      address: "Usman Road 3rd Cross, T. Nagar",
      ward: "WARD-07",
      district: "Chennai Central",
      lat: 13.0418,
      lng: 80.2341
    },
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    submittedBy: "Karthik R.",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    timeline: [
      {
        step: 1,
        stage: "REPORTED",
        status: "REPORTED",
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        actor: "Karthik R. (Citizen)",
        note: "Reported with photographic evidence.",
        completed: true
      },
      {
        step: 2,
        stage: "IN_PROGRESS",
        status: "IN_PROGRESS",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        actor: "Electrical Wing Ward 7",
        note: "Transformer cable inspection underway. Replacement bulbs dispatched.",
        completed: true
      }
    ],
    authorityUpdates: [
      {
        id: "auth_upd_3",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        author: "Electrical Wing Ward 7",
        status: "IN_PROGRESS",
        remarks: "Transformer cable inspection underway. Replacement bulbs dispatched."
      }
    ]
  }
];

// Initialize seed data into memory cache
for (const comp of SEED_COMPLAINTS) {
  memoryComplaints.set(comp.complaintId, comp);
}

// Attempt Firebase Admin initialization
try {
  const projectId = process.env.FIREBASE_PROJECT_ID || "civicai-e2ff2";
  
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: projectId
    });
  }
  
  db = admin.firestore();
  isFirestoreAvailable = true;
  console.log(`[FirebaseService] Initialized Firebase Admin for project: ${projectId}`);
} catch (error) {
  console.warn("[FirebaseService] Could not initialize Firebase Admin directly. Operating with in-memory persistence.", error.message);
  isFirestoreAvailable = false;
}

/**
 * Creates a complaint in Firestore (or fallback in-memory)
 */
export async function createComplaintRecord(complaintData) {
  const complaintId = complaintData.complaintId || `CIV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const nowIso = new Date().toISOString();

  const record = {
    ...complaintData,
    complaintId,
    id: complaintId,
    status: complaintData.status || "REPORTED",
    createdAt: complaintData.createdAt || nowIso,
    updatedAt: complaintData.updatedAt || nowIso,
    timeline: complaintData.timeline || [
      {
        step: 1,
        stage: complaintData.status || "REPORTED",
        status: complaintData.status || "REPORTED",
        timestamp: nowIso,
        actor: complaintData.submittedBy || "Citizen",
        note: "Complaint submitted via CivicAI platform.",
        completed: true
      }
    ],
    authorityUpdates: complaintData.authorityUpdates || []
  };

  // Always store in memory fallback
  memoryComplaints.set(complaintId, record);

  // If Firestore is available, attempt Firestore write
  if (isFirestoreAvailable && db) {
    try {
      await db.collection("complaints").doc(complaintId).set(record);
      console.log(`[FirebaseService] Persisted complaint ${complaintId} to Firestore.`);
    } catch (err) {
      console.warn(`[FirebaseService] Firestore write failed for ${complaintId}, kept in local memory:`, err.message);
    }
  }

  return record;
}

/**
 * Fetches all complaints with optional filtering
 */
export async function getComplaintsList(filters = {}) {
  const { userId, status, category, ward } = filters;

  if (isFirestoreAvailable && db) {
    try {
      let queryRef = db.collection("complaints");
      if (userId) queryRef = queryRef.where("userId", "==", userId);
      if (status) queryRef = queryRef.where("status", "==", status.toUpperCase());
      if (category) queryRef = queryRef.where("category", "==", category);

      const snapshot = await queryRef.get();
      if (!snapshot.empty) {
        const firestoreComplaints = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        
        // Synchronize into memory cache
        for (const c of firestoreComplaints) {
          memoryComplaints.set(c.complaintId || c.id, c);
        }
        return firestoreComplaints;
      }
    } catch (err) {
      console.warn("[FirebaseService] Firestore fetch failed, serving from memory store:", err.message);
    }
  }

  // Fallback to in-memory store
  let results = Array.from(memoryComplaints.values());

  if (userId) {
    results = results.filter((c) => c.userId === userId);
  }
  if (status) {
    results = results.filter((c) => (c.status || "").toUpperCase() === status.toUpperCase());
  }
  if (category) {
    results = results.filter((c) => (c.category || "").toLowerCase() === category.toLowerCase());
  }
  if (ward) {
    results = results.filter(
      (c) =>
        (c.location?.ward || c.ward || "").toLowerCase() === ward.toLowerCase()
    );
  }

  return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

/**
 * Fetches single complaint by ID
 */
export async function getComplaintById(complaintId) {
  if (isFirestoreAvailable && db) {
    try {
      const doc = await db.collection("complaints").doc(complaintId).get();
      if (doc.exists) {
        const data = { ...doc.data(), id: doc.id };
        memoryComplaints.set(complaintId, data);
        return data;
      }
    } catch (err) {
      console.warn(`[FirebaseService] Firestore get failed for ${complaintId}:`, err.message);
    }
  }

  return memoryComplaints.get(complaintId) || null;
}

/**
 * Updates complaint status and appends authority update
 */
export async function updateComplaintStatus(complaintId, newStatus, remarks, updatedBy = "Municipal Authority") {
  const existing = await getComplaintById(complaintId);
  if (!existing) {
    throw new Error(`Complaint ${complaintId} not found.`);
  }

  const nowIso = new Date().toISOString();
  const normalizedStatus = (newStatus || existing.status).toUpperCase();

  const newUpdate = {
    id: `upd_${Date.now()}`,
    timestamp: nowIso,
    author: updatedBy,
    status: normalizedStatus,
    remarks: remarks || `Status transitioned to ${normalizedStatus}`
  };

  const newTimelineItem = {
    step: (existing.timeline?.length || 0) + 1,
    stage: normalizedStatus,
    status: normalizedStatus,
    timestamp: nowIso,
    actor: updatedBy,
    note: remarks || `Status updated to ${normalizedStatus}`,
    completed: true
  };

  const newHistoryItem = {
    status: normalizedStatus,
    timestamp: nowIso,
    note: remarks || `Status updated to ${normalizedStatus}`,
    officer: updatedBy
  };

  const isStatusChanged = (existing.status || "").toUpperCase() !== normalizedStatus;

  const updatedRecord = {
    ...existing,
    status: normalizedStatus,
    updatedAt: nowIso,
    authorityNote: remarks || existing.authorityNote || "",
    authorityUpdates: [...(existing.authorityUpdates || []), newUpdate],
    timeline: [...(existing.timeline || []), newTimelineItem],
    statusHistory: [...(existing.statusHistory || []), newHistoryItem]
  };

  // Update memory
  memoryComplaints.set(complaintId, updatedRecord);

  // Update Firestore if available
  if (isFirestoreAvailable && db) {
    try {
      await db.collection("complaints").doc(complaintId).update({
        status: normalizedStatus,
        updatedAt: nowIso,
        authorityNote: remarks || "",
        authorityUpdates: admin.firestore.FieldValue.arrayUnion(newUpdate),
        timeline: admin.firestore.FieldValue.arrayUnion(newTimelineItem),
        statusHistory: admin.firestore.FieldValue.arrayUnion(newHistoryItem)
      });
      console.log(`[FirebaseService] Firestore status updated for ${complaintId}`);

      // Create notification for citizen if status changed
      if (isStatusChanged && existing.userId) {
        const notifId = `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        let notifTitle = "Complaint Status Updated";
        let notifMessage = `Your complaint ${complaintId} has been moved to ${normalizedStatus}.`;

        if (normalizedStatus === "RESOLVED") {
          notifTitle = "Complaint Resolved";
          notifMessage = `Your complaint ${complaintId} has been marked as Resolved by the authority.`;
        } else if (normalizedStatus === "REJECTED") {
          notifTitle = "Complaint Update";
          notifMessage = `Your complaint ${complaintId} has been rejected. Please check the complaint details for more information.`;
        } else if (normalizedStatus === "ASSIGNED") {
          notifTitle = "Complaint Assigned";
          notifMessage = `Your complaint ${complaintId} has been assigned to the relevant department.`;
        } else if (normalizedStatus === "IN_PROGRESS") {
          notifTitle = "Complaint In Progress";
          notifMessage = `Your complaint ${complaintId} has been moved to IN PROGRESS.`;
        } else if (normalizedStatus === "UNDER_REVIEW") {
          notifTitle = "Complaint Status Updated";
          notifMessage = `Your complaint ${complaintId} has been moved to UNDER REVIEW.`;
        }

        const notifDoc = {
          notificationId: notifId,
          id: notifId,
          userId: existing.userId,
          complaintId: existing.complaintId || complaintId,
          type: "COMPLAINT_STATUS_UPDATE",
          title: notifTitle,
          message: notifMessage,
          status: normalizedStatus,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        };

        await db.collection("notifications").doc(notifId).set(notifDoc);
        console.log(`[FirebaseService] Notification ${notifId} created for citizen ${existing.userId}`);
      }
    } catch (err) {
      console.warn(`[FirebaseService] Firestore status update failed for ${complaintId}:`, err.message);
    }
  }

  return updatedRecord;
}
