import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, Bell, LogOut, CheckCheck } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useCivicData } from "../../context/CivicDataContext";
import { useAuth } from "../../context/AuthContext";
import { formatTimeAgo } from "../../services/complaintService";

export default function Header({ onMenuClick, role = "citizen" }) {
  const { isDark, toggleTheme } = useTheme();
  const {
    currentUser,
    notifications = [],
    unreadCount = 0,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useCivicData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="portal-topbar">
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

        {/* Portal Breadcrumb / Location Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
              backgroundColor: role === "authority" ? "rgba(124, 58, 237, 0.12)" : "rgba(37, 99, 235, 0.12)",
              color: role === "authority" ? "#7c3aed" : "var(--primary)",
              border: role === "authority" ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid var(--primary-border)"
            }}
          >
            {role === "authority" ? "🏛️ Civic Authority Portal" : "👤 Citizen Workspace"}
          </span>

          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-subtle)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            {role === "authority" ? "Operations Active" : (currentUser.district || "Chennai South")}
          </span>

          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              display: "none"
            }}
            className="header-district-badge"
          >
            {currentUser.district} • {role === "authority" ? currentUser.department : currentUser.ward}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Theme Toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
        </button>

        {/* Real-time Notification Bell */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Notifications"
            aria-label="Notifications"
            style={{ position: "relative" }}
          >
            <Bell size={18} />
            {/* Show badge only when there are unread notifications */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.4)",
                  border: "2px solid var(--bg-card)",
                  lineHeight: 1
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: 0,
                width: "360px",
                maxWidth: "calc(100vw - 2rem)",
                backgroundColor: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-medium)",
                boxShadow: "var(--shadow-xl)",
                zIndex: 1000,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Dropdown Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-subtle)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        backgroundColor: "var(--primary)",
                        color: "#ffffff",
                        padding: "1px 6px",
                        borderRadius: "var(--radius-full)",
                        fontWeight: 700
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllNotificationsAsRead();
                    }}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 4px"
                    }}
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {(!notifications || notifications.length === 0) ? (
                  <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    <Bell size={26} style={{ margin: "0 auto 0.6rem auto", opacity: 0.35, display: "block" }} />
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>No notifications yet</p>
                    <span style={{ fontSize: "0.75rem", lineHeight: 1.4, display: "block" }}>
                      You'll receive real-time updates when municipal authorities take action on your complaints.
                    </span>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isUnread = !item.read;
                    return (
                      <div
                        key={item.id || item.notificationId}
                        onClick={async () => {
                          if (isUnread) {
                            await markNotificationAsRead(item.id || item.notificationId);
                          }
                          setShowNotifications(false);
                          if (item.complaintId) {
                            navigate(`/citizen/complaints/${item.complaintId}`);
                          }
                        }}
                        style={{
                          padding: "0.85rem 1rem",
                          borderBottom: "1px solid var(--border-subtle)",
                          backgroundColor: isUnread ? "rgba(37, 99, 235, 0.07)" : "transparent",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "flex-start"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isUnread ? "rgba(37, 99, 235, 0.12)" : "var(--bg-subtle)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isUnread ? "rgba(37, 99, 235, 0.07)" : "transparent";
                        }}
                      >
                        {/* Blue Dot for Unread */}
                        <div style={{ marginTop: "5px", width: "8px", height: "8px", flexShrink: 0 }}>
                          {isUnread && (
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary)"
                              }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "2px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: isUnread ? 700 : 600, color: "var(--text-main)" }}>
                              {item.title || "Complaint Status Updated"}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 6px 0", lineHeight: 1.35 }}>
                            {item.message}
                          </p>
                          {item.status && (
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                padding: "1px 7px",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: "var(--bg-subtle)",
                                color: "var(--primary)",
                                border: "1px solid var(--border-subtle)"
                              }}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Profile */}
        <Link
          to={role === "authority" ? "/authority/settings" : "/citizen/profile"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.35rem 0.6rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: role === "authority" ? "#7c3aed" : "var(--primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.8rem"
            }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ display: "none" }} className="header-user-info">
            <span style={{ fontSize: "0.825rem", fontWeight: 600, display: "block", lineHeight: 1.1 }}>
              {currentUser.name}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {role === "authority" ? "Zonal Officer" : "Registered Resident"}
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
        @media (min-width: 768px) {
          .header-district-badge { display: inline-block !important; }
          .header-user-info { display: block !important; }
        }
      `}</style>
    </header>
  );
}
