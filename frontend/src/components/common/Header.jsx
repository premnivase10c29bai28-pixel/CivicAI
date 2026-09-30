import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  LogOut,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
  Clock,
  User
} from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";
import { useAuth } from "../../context/AuthContext";
import CivicAILogo from "./CivicAILogo";

export default function Header({ onMenuClick, role = "citizen" }) {
  const { currentUser, complaints } = useCivicData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Connectivity state for authentic service-status indicator
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // UI Language switcher state
  const [selectedLanguage, setSelectedLanguage] = useState(
    currentUser?.preferredLanguage || "English"
  );

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    if (currentUser) {
      currentUser.preferredLanguage = lang;
    }
  };

  // Notification system derived from live complaints & timeline events
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());
  const notifRef = useRef(null);

  // Generate notifications from recent complaints
  const notifications = React.useMemo(() => {
    const list = [];
    const relevantComplaints = complaints.slice(0, 10);

    relevantComplaints.forEach((c) => {
      const status = (c.status || "REPORTED").toUpperCase();
      let text = `Complaint ${c.id} status is ${c.status}.`;
      if (status === "UNDER_REVIEW" || status === "UNDER REVIEW") {
        text = `Complaint ${c.id} is now Under Review.`;
      } else if (status === "ASSIGNED") {
        text = `Complaint ${c.id} has been assigned to ${c.department || "Municipal Operations"}.`;
      } else if (status === "IN_PROGRESS" || status === "IN PROGRESS") {
        text = `Complaint ${c.id} work is In Progress.`;
      } else if (status === "RESOLVED") {
        text = `Complaint ${c.id} has been marked Resolved.`;
      } else if (status === "REPORTED") {
        text = `Complaint ${c.id} registered successfully.`;
      }

      list.push({
        id: `notif-${c.id}-${status}`,
        complaintId: c.id,
        title: text,
        time: c.updatedAt || c.submittedAt || new Date().toISOString(),
        status: c.status
      });
    });

    return list;
  }, [complaints]);

  const unreadCount = notifications.filter((n) => !readNotificationIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadNotificationIds(allIds);
  };

  const markSingleAsRead = (id) => {
    setReadNotificationIds((prev) => new Set([...prev, id]));
  };

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header
      className="portal-topbar"
      style={{
        backgroundColor: "var(--bg-header)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 40
      }}
    >
      {/* Left side: Hamburger + CivicAI Brand Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Mobile menu button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onMenuClick}
          aria-label="Toggle navigation drawer"
          style={{ display: "inline-flex" }}
        >
          <Menu size={20} />
        </button>

        {/* Brand identity on portal header */}
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <CivicAILogo size={32} showTagline shortTagline />
        </Link>
      </div>

      {/* Right side: Operational Badge + Language + Notifications + User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Service-status indicator */}
        <div className="gov-operational-badge header-operational-indicator">
          <span
            className="gov-operational-dot"
            style={{
              backgroundColor: isOnline ? "#238636" : "#B7791F"
            }}
          />
          <span style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            {isOnline ? "CivicAI Services Operational" : "Operating in Offline Mode"}
          </span>
        </div>

        {/* Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="header-lang-selector">
          <Globe size={15} color="var(--primary)" />
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            aria-label="Select portal language"
            style={{
              padding: "4px 8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-main)",
              cursor: "pointer"
            }}
          >
            <option value="English">English</option>
            <option value="Tamil">தமிழ்</option>
          </select>
        </div>

        {/* Notifications Bell with Functional Popover */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Civic Notifications"
            aria-label={`Notifications, ${unreadCount} unread`}
            style={{ position: "relative" }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 4px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "360px",
                maxWidth: "90vw",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 100,
                overflow: "hidden"
              }}
            >
              {/* Dropdown Header */}
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg-subtle)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "#ffffff",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "var(--radius-full)"
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No recent notifications.
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isRead = readNotificationIds.has(item.id);
                    const complaintLink = role === "authority"
                      ? `/authority/complaints`
                      : `/citizen/complaints/${item.complaintId}`;

                    return (
                      <Link
                        key={item.id}
                        to={complaintLink}
                        onClick={() => {
                          markSingleAsRead(item.id);
                          setNotificationsOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          padding: "0.85rem 1rem",
                          borderBottom: "1px solid var(--border-subtle)",
                          backgroundColor: isRead ? "transparent" : "rgba(18, 59, 99, 0.03)",
                          textDecoration: "none",
                          transition: "background-color 0.15s ease"
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "var(--bg-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                            color: "var(--primary)"
                          }}
                        >
                          <CheckCircle2 size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.825rem",
                              fontWeight: isRead ? 500 : 700,
                              color: "var(--text-main)",
                              marginBottom: "2px",
                              lineHeight: 1.35
                            }}
                          >
                            {item.title}
                          </p>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {new Date(item.time).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {!isRead && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "var(--primary)",
                              flexShrink: 0,
                              marginTop: "6px"
                            }}
                          />
                        )}
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: "var(--bg-subtle)",
                  textAlign: "center",
                  borderTop: "1px solid var(--border-subtle)"
                }}
              >
                <Link
                  to={role === "authority" ? "/authority/complaints" : "/citizen/complaints"}
                  onClick={() => setNotificationsOpen(false)}
                  style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                >
                  View All Complaints →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <Link
          to={role === "authority" ? "/authority/settings" : "/citizen/profile"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.3rem 0.65rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-medium)"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.8rem"
            }}
          >
            {(currentUser.name || "C").charAt(0).toUpperCase()}
          </div>
          <div style={{ display: "none" }} className="header-user-info">
            <span style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", lineHeight: 1.1 }}>
              {currentUser.name}
            </span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
              {role === "authority" ? "Civic Authority" : `${currentUser.ward || "Ward 12"} Resident`}
            </span>
          </div>
        </Link>

        {/* Sign Out Button */}
        <button
          type="button"
          className="btn-icon"
          onClick={handleSignOut}
          title="Sign Out of CivicAI"
          aria-label="Sign Out"
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut size={17} />
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .header-operational-indicator { display: none !important; }
        }
        @media (min-width: 768px) {
          .header-user-info { display: block !important; }
        }
      `}</style>
    </header>
  );
}
