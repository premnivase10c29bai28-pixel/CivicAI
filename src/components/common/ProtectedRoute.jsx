import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sparkles, Loader2 } from "lucide-react";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          backgroundColor: "var(--bg-main)",
          color: "var(--text-main)"
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)"
          }}
        >
          <Sparkles size={24} className="animate-spin" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", fontWeight: 600 }}>
          <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
          <span>Verifying CivicAI authentication...</span>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If citizen tries to access authority, redirect to citizen portal
    if (role === "citizen") {
      return <Navigate to="/citizen" replace />;
    }
    // If authority tries to access citizen, redirect to authority portal
    if (role === "authority") {
      return <Navigate to="/authority" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
