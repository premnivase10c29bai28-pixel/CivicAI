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
  LogOut,
  Search,
  HelpCircle,
  ShieldCheck,
  Brain
} from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";
import { useAuth } from "../../context/AuthContext";
import CivicAILogo from "./CivicAILogo";

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
    { label: "Report a Problem", path: "/citizen/report", icon: PlusCircle, highlight: true },
    {
      label: "My Complaints",
      path: "/citizen/complaints",
      icon: ListTodo,
      badge: citizenComplaintsCount
    },
    { label: "Track Complaint", path: "/citizen/complaints", icon: Search },
    { label: "Civic Insights", path: "/citizen/insights", icon: Sparkles },
    { label: "Citizen Profile", path: "/citizen/profile", icon: User },
    { label: "Help & Support", path: "/citizen/profile", icon: HelpCircle }
  ];

  const authorityNavItems = [
    { label: "Authority Dashboard", path: "/authority", icon: LayoutDashboard, exact: true },
    {
      label: "Complaints Triage",
      path: "/authority/complaints",
      icon: ListTodo,
      badge: complaints.length
    },
    { label: "Civic Map", path: "/authority/map", icon: MapPin },
    {
      label: "Civic Hotspots",
      path: "/authority/hotspots",
      icon: Flame,
      badge: hotspots.length,
      badgeColor: "#E88A1A"
    },
    { label: "Development Insights", path: "/authority/insights", icon: Brain },
    { label: "Civic Analytics", path: "/authority/analytics", icon: BarChart3 },
    { label: "Public Data & Reports", path: "/authority/reports", icon: FileSpreadsheet },
    { label: "Authority Profile", path: "/authority/settings", icon: Settings }
  ];

  const navItems = role === "authority" ? authorityNavItems : citizenNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`portal-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div
          className="portal-sidebar-brand"
          style={{
            padding: "1.25rem 1rem",
            backgroundColor: "#081C35",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Link
            to="/"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none"
            }}
          >
            <CivicAILogo inverted size={32} showTagline shortTagline />
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            style={{ color: "#94a3b8", display: "none" }}
            id="sidebar-close-btn"
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portal Scope Badge */}
        <div
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            fontSize: "0.72rem",
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <ShieldCheck size={13} color="#E88A1A" />
          <span>
            {role === "authority"
              ? "Municipal Administration Console"
              : "Registered Citizen Services"}
          </span>
        </div>

        {/* Navigation list */}
        <div className="portal-sidebar-nav" style={{ padding: "1rem 0.75rem" }}>
          <div
            className="nav-category-title"
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748B",
              padding: "0 0.5rem 0.6rem"
            }}
          >
            {role === "authority" ? "Administrative Modules" : "Public Services"}
          </div>

          {navItems.map((item, index) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <NavLink
                key={`${item.path}-${index}`}
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? "active" : ""}`}
                style={
                  item.highlight
                    ? {
                        backgroundColor: isActive ? "#1769AA" : "rgba(23, 105, 170, 0.2)",
                        color: isActive ? "#ffffff" : "#93c5fd",
                        fontWeight: 600,
                        border: "1px solid rgba(23, 105, 170, 0.4)"
                      }
                    : {}
                }
              >
                <Icon size={17} strokeWidth={2} />
                <span style={{ fontSize: "0.85rem" }}>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="nav-badge"
                    style={
                      item.badgeColor
                        ? { backgroundColor: item.badgeColor }
                        : { backgroundColor: "var(--primary-blue)" }
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
        <div
          className="portal-sidebar-footer"
          style={{
            marginTop: "auto",
            padding: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#07172C",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem"
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#64748B", paddingBottom: "4px" }}>
            Helpline: <strong>1913</strong> (Toll-Free)
          </div>

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
            <span>Public Information Portal</span>
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
