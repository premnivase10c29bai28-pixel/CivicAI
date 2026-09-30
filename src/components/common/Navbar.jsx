import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon, Shield, User, ArrowRight, Menu, X, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useCivicData } from "../../context/CivicDataContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, switchRole } = useCivicData();
  const { currentUser: authUser, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background-color 0.2s ease"
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 10px rgba(29, 78, 216, 0.3)"
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-main)" }}>
                Civic<span style={{ color: "var(--primary)" }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(2, 132, 199, 0.12)",
                  color: "var(--ai-accent)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase"
                }}
              >
                Civic-Tech
              </span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "-2px" }}>
              Better Communities with AI
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "1.75rem",
            fontSize: "0.9rem",
            fontWeight: 500
          }}
          className="desktop-nav"
        >
          <a href="/#how-it-works" style={{ color: "var(--text-secondary)" }}>
            How It Works
          </a>
          <a href="/#features" style={{ color: "var(--text-secondary)" }}>
            Features
          </a>
          <a href="/#benefits" style={{ color: "var(--text-secondary)" }}>
            Benefits
          </a>
          <a href="/#ai-intelligence" style={{ color: "var(--text-secondary)" }}>
            AI Intelligence
          </a>
          <Link
            to="/citizen"
            style={{
              color: location.pathname.startsWith("/citizen") ? "var(--primary)" : "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <User size={15} />
            Citizen Portal
          </Link>
          <Link
            to="/authority"
            style={{
              color: location.pathname.startsWith("/authority") ? "var(--primary)" : "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Shield size={15} />
            Authority Portal
          </Link>
        </nav>

        {/* Right Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Theme Toggle */}
          <button
            type="button"
            className="btn-icon"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} />}
          </button>

          {/* Quick Actions */}
          <div style={{ display: "none" }} className="desktop-actions">
            {authUser ? (
              <>
                {role === "authority" ? (
                  <Link to="/authority" className="btn btn-primary btn-sm">
                    <span>Authority Console</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link to="/citizen/report" className="btn btn-primary btn-sm">
                    <span>Report a Problem</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSignOut}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/citizen/report" className="btn btn-primary btn-sm">
                  <span>Report a Problem</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="btn-icon mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--bg-card)",
            borderBottom: "1px solid var(--border-medium)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
        >
          <a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>
            How It Works
          </a>
          <a href="/#features" onClick={() => setMobileMenuOpen(false)}>
            Features
          </a>
          <a href="/#benefits" onClick={() => setMobileMenuOpen(false)}>
            Benefits
          </a>
          {authUser ? (
            role === "authority" ? (
              <Link to="/authority" onClick={() => setMobileMenuOpen(false)}>
                Authority Portal
              </Link>
            ) : (
              <Link to="/citizen" onClick={() => setMobileMenuOpen(false)}>
                Citizen Portal
              </Link>
            )
          ) : (
            <>
              <Link to="/citizen" onClick={() => setMobileMenuOpen(false)}>
                Citizen Portal
              </Link>
              <Link to="/authority" onClick={() => setMobileMenuOpen(false)}>
                Authority Portal
              </Link>
            </>
          )}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
            {authUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            ) : (
              <>
                <Link to="/citizen/report" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Report Problem
                </Link>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; gap: 0.6rem; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
