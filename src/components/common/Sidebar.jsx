import React from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  Sparkles,
  User,
  Settings,
  MapPin,
  Flame,
  BarChart3,
  FileSpreadsheet,
  X,
  Compass,
  LogOut
} from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isOpen, onClose, role = "citizen" }) {
  const { complaints, hotspots, currentUser } = useCivicData();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const citizenComplaintsCount = complaints.filter(
    (c) => c.userId === currentUser.id || c.submittedBy === currentUser.name || !c.userId
  ).length;

  const citizenNavItems = [
    { label: "Dashboard", path: "/citizen", icon: LayoutDashboard, exact: true },
    { label: "Report Problem", path: "/citizen/report", icon: PlusCircle, highlight: true },
    {
      label: "My Complaints",
      path: "/citizen/complaints",
      icon: ListTodo,
      badge: citizenComplaintsCount
    },
    { label: "Civic Insights", path: "/citizen/insights", icon: Sparkles },
    { label: "My Profile", path: "/citizen/profile", icon: User },
    { label: "Settings", path: "/citizen/profile#settings", icon: Settings }
  ];

  const authorityNavItems = [
    { label: "Overview", path: "/authority", icon: LayoutDashboard, exact: true },
    {
      label: "Complaints",
      path: "/authority/complaints",
      icon: ListTodo,
      badge: complaints.length
    },
    { label: "Civic Map", path: "/authority/map", icon: MapPin },
    {
      label: "Hotspots",
      path: "/authority/hotspots",
      icon: Flame,
      badge: hotspots.length,
      badgeColor: "#ea580c"
    },
    { label: "Civic Analytics", path: "/authority/analytics", icon: BarChart3 },
    { label: "AI Insights", path: "/authority/insights", icon: Sparkles },
    { label: "Civic Reports", path: "/authority/reports", icon: FileSpreadsheet },
    { label: "Settings", path: "/authority/settings", icon: Settings }
  ];

  const navItems = role === "authority" ? authorityNavItems : citizenNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`portal-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="portal-sidebar-brand">
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.1
                }}
              >
                Civic<span style={{ color: "#38bdf8" }}>AI</span>
              </div>
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600
                }}
              >
                {role === "authority" ? "Authority Console" : "Citizen Workspace"}
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            style={{ color: "#94a3b8", display: "none" }}
            id="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="portal-sidebar-nav">
          <div className="nav-category-title">
            {role === "authority" ? "Operations & Triage" : "Citizen Services"}
          </div>

          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? "active" : ""}`}
                style={
                  item.highlight
                    ? {
                        backgroundColor: isActive ? "var(--primary)" : "rgba(37, 99, 235, 0.15)",
                        color: isActive ? "#ffffff" : "#60a5fa"
                      }
                    : {}
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="nav-badge"
                    style={
                      item.badgeColor
                        ? { backgroundColor: item.badgeColor }
                        : {}
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="portal-sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              color: "#94a3b8"
            }}
          >
            <Compass size={14} />
            <span>Return to Public Home</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              color: "#f87171",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              textAlign: "left"
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            #sidebar-close-btn { display: inline-flex !important; }
          }
        `}</style>
      </aside>
    </>
  );
}
