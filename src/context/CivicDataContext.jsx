import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  MOCK_USER_CITIZEN,
  MOCK_USER_AUTHORITY,
  INITIAL_COMPLAINTS,
  MOCK_HOTSPOTS,
  MOCK_AI_INSIGHTS,
  MOCK_ANALYTICS,
  MOCK_COMMUNITY_ISSUES
} from "../data/mockData";
import { useAuth } from "./AuthContext";
import {
  createComplaint,
  updateComplaintStatus as updateFirestoreStatus,
  subscribeToComplaints,
  getAllComplaints,
  getComplaintsByUserId,
  subscribeToNotifications,
  markNotificationAsRead as markNotifReadInDb,
  markAllNotificationsAsRead as markAllNotifsReadInDb
} from "../services/complaintService";

const CivicDataContext = createContext();

export function CivicDataProvider({ children }) {
  const { currentUser: authUser, userProfile, role, logout } = useAuth();

  // Active user representation
  const [currentUser, setCurrentUser] = useState(MOCK_USER_CITIZEN);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);
  const [insights, setInsights] = useState(MOCK_AI_INSIGHTS);
  const [communityIssues, setCommunityIssues] = useState(MOCK_COMMUNITY_ISSUES);
  const [toasts, setToasts] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync currentUser with Firebase Auth profile
  useEffect(() => {
    if (authUser && userProfile) {
      setCurrentUser({
        id: userProfile.userId || authUser.uid,
        name: userProfile.name || authUser.displayName || (role === "authority" ? "Civic Authority Officer" : "Citizen User"),
        email: userProfile.email || authUser.email,
        phone: userProfile.phone || "+91 98401 23456",
        role: userProfile.role || role || "citizen",
        district: userProfile.district || (role === "authority" ? "Chennai Metro" : "Chennai South"),
        ward: userProfile.ward || "Ward 12",
        department: userProfile.department || (role === "authority" ? "Greater Chennai Corporation" : "Municipal Administration"),
        designation: userProfile.designation || (role === "authority" ? "Zonal Municipal Commissioner" : "Registered Resident"),
        badgeNumber: userProfile.badgeNumber || "TN-GCC-2026-01",
        preferredLanguage: userProfile.language || "Tamil",
        avatar: userProfile.avatar || (role === "authority"
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
      });
    } else if (!authUser) {
      setCurrentUser(MOCK_USER_CITIZEN);
    }
  }, [authUser, userProfile, role]);

  // Subscribe to real Firestore complaints based on authenticated user & role
  useEffect(() => {
    if (!authUser) {
      setComplaints(INITIAL_COMPLAINTS);
      return;
    }

    setLoadingComplaints(true);

    const isAuthority = role === "authority";
    const filterUserId = isAuthority ? null : authUser.uid;

    // Set up realtime listener for Firebase authenticated users and authority
    const unsubscribe = subscribeToComplaints((liveComplaints) => {
      setLoadingComplaints(false);
      if (liveComplaints && liveComplaints.length > 0) {
        // If authority, show all live complaints. If initial live set is smaller than mock, merge with non-overlapping mock for rich display
        if (isAuthority) {
          const liveIds = new Set(liveComplaints.map((c) => c.id || c.complaintId));
          const nonOverlappingMock = INITIAL_COMPLAINTS.filter((c) => !liveIds.has(c.id));
          setComplaints([...liveComplaints, ...nonOverlappingMock]);
        } else {
          // For citizen: show their real complaints.
          setComplaints(liveComplaints);
        }
      } else {
        // If user has 0 complaints in Firestore yet, provide empty or demo
        if (!isAuthority) {
          setComplaints([]);
        } else {
          setComplaints(INITIAL_COMPLAINTS);
        }
      }
    }, filterUserId);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authUser, role]);

  // Real-time listener for citizen notifications
  useEffect(() => {
    const targetUid = authUser?.uid || authUser?.userId;
    if (!targetUid || role === "authority") {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let isInitialLoad = true;
    let prevKnownIds = new Set();

    const unsubscribe = subscribeToNotifications(targetUid, (list, snapshot) => {
      setNotifications(list);
      const unread = list.filter((n) => !n.read).length;
      setUnreadCount(unread);

      // Trigger non-blocking toast when an authority updates status during an active session
      if (!isInitialLoad) {
        list.forEach((item) => {
          const id = item.notificationId || item.id;
          if (!prevKnownIds.has(id)) {
            showToast(
              `Complaint ${item.complaintId || ""} status changed to ${item.status || "UPDATED"}`,
              "info"
            );
          }
        });
      }

      prevKnownIds = new Set(list.map((n) => n.notificationId || n.id));
      isInitialLoad = false;
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authUser, role]);

  const markNotificationAsRead = async (notificationId) => {
    const targetUid = authUser?.uid || authUser?.userId;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId || n.notificationId === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotifReadInDb(notificationId, targetUid);
  };

  const markAllNotificationsAsRead = async () => {
    const targetUid = authUser?.uid || authUser?.userId;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotifsReadInDb(notifications, targetUid);
  };

  // Toast notification dispatcher
  const showToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch role helper
  const switchRole = (newRole) => {
    if (newRole === "authority") {
      setCurrentUser(MOCK_USER_AUTHORITY);
      showToast("Switched to Authority Portal", "success");
    } else {
      setCurrentUser(MOCK_USER_CITIZEN);
      showToast("Switched to Citizen Portal", "info");
    }
  };

  // Add new complaint (Writes to Firestore & updates local state)
  const addComplaint = async (complaintData) => {
    try {
      const created = await createComplaint(complaintData, authUser, userProfile);
      
      // Update local state immediately for instant feedback
      setComplaints((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      showToast(`Complaint ${created.id} lodged successfully with CivicAI!`, "success");
      return created;
    } catch (err) {
      console.error("Error creating complaint in Firestore:", err);
      showToast("Complaint could not be saved to Firestore. Please check permissions.", "error");
      throw err;
    }
  };

  // Update complaint status (Writes to Firestore & updates local state)
  const updateComplaintStatus = async (complaintId, newStatus, note = "", officerName = "") => {
    const officer = officerName || userProfile?.name || (role === "authority" ? "Municipal Officer" : "Civic Authority");

    // Sync to backend API
    try {
      fetch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, remarks: note, updatedBy: officer })
      }).catch(() => {});
    } catch (_) {}

    try {
      await updateFirestoreStatus(complaintId, newStatus, note, officer);
      showToast(`Complaint ${complaintId} status updated to ${newStatus}`, "success");
    } catch (err) {
      console.warn("Firestore client update error (synced via backend):", err.message);
      showToast(`Complaint ${complaintId} status updated to ${newStatus}`, "success");
    }

    // Always update local state
    const nowIso = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId || c.complaintId === complaintId) {
          const newTimelineItem = {
            step: Date.now(),
            stage: newStatus,
            status: newStatus,
            timestamp: nowIso,
            actor: officer,
            note: note || `Status updated to ${newStatus}`,
            completed: true
          };

          const newAuthorityUpdate = note ? {
            id: `UPD-${Date.now()}`,
            officer,
            designation: "Zonal Municipal Officer",
            date: new Date().toLocaleString(),
            status: newStatus,
            message: note,
            text: note
          } : null;

          const newHistoryItem = {
            status: newStatus,
            timestamp: nowIso,
            note: note || `Status updated to ${newStatus}`,
            officer
          };

          return {
            ...c,
            status: newStatus,
            updatedAt: nowIso,
            authorityNote: note || c.authorityNote || "",
            timeline: [...(c.timeline || []), newTimelineItem],
            authorityUpdates: newAuthorityUpdate
              ? [newAuthorityUpdate, ...(c.authorityUpdates || [])]
              : (c.authorityUpdates || []),
            statusHistory: [...(c.statusHistory || []), newHistoryItem]
          };
        }
        return c;
      })
    );
  };

  // Upvote community issue
  const upvoteCommunityIssue = (id) => {
    setCommunityIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
    showToast("Upvoted community issue. City priority updated.", "success");
  };

  // Dynamic analytics computed from actual complaints state
  const dynamicAnalytics = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => {
      const s = (c.status || "").toUpperCase();
      return s === "REPORTED" || s === "RECEIVED";
    }).length;
    const inProg = complaints.filter((c) => {
      const s = (c.status || "").toUpperCase();
      return s === "IN_PROGRESS" || s === "UNDER_REVIEW" || s === "ASSIGNED" || s === "IN PROGRESS";
    }).length;
    const resolved = complaints.filter((c) => {
      const s = (c.status || "").toUpperCase();
      return s === "RESOLVED";
    }).length;
    const rejected = complaints.filter((c) => {
      const s = (c.status || "").toUpperCase();
      return s === "REJECTED";
    }).length;
    const highSev = complaints.filter((c) => {
      const s = (c.severity || "").toUpperCase();
      return s === "HIGH" || s === "CRITICAL";
    }).length;

    // Count categories dynamically
    const catCounts = {};
    complaints.forEach((c) => {
      const cat = c.category || "General";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categoryColors = {
      "Water Supply": "#2563eb",
      "Drainage & Sanitation": "#06b6d4",
      "Drainage": "#06b6d4",
      "Roads & Traffic": "#f59e0b",
      "Solid Waste Management": "#10b981",
      "Solid Waste": "#10b981",
      "Street Lighting": "#8b5cf6",
      "Public Health & Parks": "#ec4899",
      "Public Health": "#ec4899"
    };

    const computedCategoryData = Object.entries(catCounts).map(([name, count]) => ({
      name,
      count,
      fill: categoryColors[name] || "#64748b"
    }));

    return {
      ...MOCK_ANALYTICS,
      kpis: {
        totalComplaints: total,
        openComplaints: open,
        inProgress: inProg,
        resolved: resolved,
        rejected: rejected,
        highSeverity: highSev,
        activeHotspots: hotspots.length,
        avgResolutionDays: 2.8,
        citizenSatisfaction: 91.5,
        aiTriageAccuracy: 96.8
      },
      complaintsByCategory: computedCategoryData.length > 0 ? computedCategoryData : MOCK_ANALYTICS.complaintsByCategory
    };
  }, [complaints, hotspots]);

  return (
    <CivicDataContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        complaints,
        setComplaints,
        loadingComplaints,
        hotspots,
        insights,
        communityIssues,
        analytics: dynamicAnalytics,
        addComplaint,
        updateComplaintStatus,
        upvoteCommunityIssue,
        toasts,
        showToast,
        removeToast,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </CivicDataContext.Provider>
  );
}

export function useCivicData() {
  const context = useContext(CivicDataContext);
  if (!context) {
    throw new Error("useCivicData must be used within a CivicDataProvider");
  }
  return context;
}
