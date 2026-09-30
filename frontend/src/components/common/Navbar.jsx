import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Shield, User, ArrowRight, Menu, X, LogOut, Home, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useCivicData } from "../../context/CivicDataContext";
import { useAuth } from "../../context/AuthContext";
import CivicAILogo from "./CivicAILogo";

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser: authUser, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const isCitizenActive = location.pathname.startsWith("/citizen");
  const isAuthorityActive = location.pathname.startsWith("/authority");
  const isHomeActive = location.pathname === "/" && !location.hash;

  return (
    <header
      className="civic-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background-color 0.2s ease",
        width: "100%"
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "0 1.25rem",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}
      >
        {/* Brand Logo - Fixed left, never wraps or collapses */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none"
            }}
            className="navbar-brand-link"
            aria-label="CivicAI Home"
          >
            <CivicAILogo size={34} showTagline={true} shortTagline={true} />
          </Link>
        </div>

        {/* Center Nav Links (Desktop >= 1060px) - Home, Works, Features, Benefits, AI Intelligence, Citizen Portal, Authority Portal */}
        <nav
          className="desktop-nav-links"
          style={{
            display: "none",
            alignItems: "center",
            gap: "clamp(0.6rem, 1.2vw, 1.25rem)",
            fontSize: "0.875rem",
            fontWeight: 500,
            whiteSpace: "nowrap"
          }}
          aria-label="Primary Navigation"
        >
          <Link
            to="/"
            style={{
              color: isHomeActive ? "var(--primary-blue, #1769AA)" : "var(--text-secondary)",
              fontWeight: isHomeActive ? 600 : 500,
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            Home
          </Link>

          <a
            href="/#how-it-works"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            Works
          </a>

          <a
            href="/#features"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            Features
          </a>

          <a
            href="/#benefits"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            Benefits
          </a>

          <a
            href="/#ai-intelligence"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            AI Intelligence
          </a>

          <Link
            to="/citizen"
            style={{
              color: isCitizenActive ? "var(--primary-blue, #1769AA)" : "var(--text-secondary)",
              fontWeight: isCitizenActive ? 600 : 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            <User size={15} style={{ flexShrink: 0 }} />
            <span>Citizen Portal</span>
          </Link>

          <Link
            to="/authority"
            style={{
              color: isAuthorityActive ? "var(--primary-blue, #1769AA)" : "var(--text-secondary)",
              fontWeight: isAuthorityActive ? 600 : 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              textDecoration: "none",
              padding: "0.4rem 0.5rem",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
          >
            <Shield size={15} style={{ flexShrink: 0 }} />
            <span>Authority Portal</span>
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle + Desktop Action Buttons + Mobile Menu Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            flexShrink: 0
          }}
        >
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn-icon"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle color theme"
            style={{ flexShrink: 0 }}
          >
            {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
          </button>

          {/* Desktop Action Buttons */}
          <div
            className="desktop-action-group"
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.5rem",
              flexShrink: 0
            }}
          >
            {authUser ? (
              <>
                {role === "authority" ? (
                  <Link
                    to="/authority"
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    <span>Authority Console</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    to="/citizen/report"
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    <span>Report a Problem</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSignOut}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/citizen/report"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  <span>Report a Problem</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile / Tablet < 1060px) */}
          <button
            type="button"
            className="btn-icon mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu (< 1060px) */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--bg-card)",
            borderBottom: "1px solid var(--border-medium)",
            boxShadow: "0 8px 24px rgba(18, 59, 99, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem"
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isHomeActive ? "var(--primary-blue, #1769AA)" : "var(--text-main)",
              fontWeight: isHomeActive ? 700 : 500,
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            Home
          </Link>

          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: "var(--text-main)",
              fontWeight: 500,
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            Works
          </a>

          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: "var(--text-main)",
              fontWeight: 500,
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            Features
          </a>

          <a
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: "var(--text-main)",
              fontWeight: 500,
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            Benefits
          </a>

          <a
            href="/#ai-intelligence"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: "var(--text-main)",
              fontWeight: 500,
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            AI Intelligence
          </a>

          <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "0.25rem 0" }} />

          <Link
            to="/citizen"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isCitizenActive ? "var(--primary-blue, #1769AA)" : "var(--text-main)",
              fontWeight: isCitizenActive ? 700 : 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            <User size={16} />
            <span>Citizen Portal</span>
          </Link>

          <Link
            to="/authority"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isAuthorityActive ? "var(--primary-blue, #1769AA)" : "var(--text-main)",
              fontWeight: isAuthorityActive ? 700 : 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              padding: "0.4rem 0",
              fontSize: "0.95rem"
            }}
          >
            <Shield size={16} />
            <span>Authority Portal</span>
          </Link>

          {/* Mobile Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              paddingTop: "0.85rem",
              borderTop: "1px solid var(--border-subtle)"
            }}
          >
            {authUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "center" }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <Link
                  to="/citizen/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                >
                  Report a Problem
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Breakpoint Rules */}
      <style>{`
        @media (min-width: 1060px) {
          .desktop-nav-links { display: flex !important; }
          .desktop-action-group { display: flex !important; }
          .mobile-menu-toggle { display: none !important; }
          .mobile-nav-drawer { display: none !important; }
        }
        @media (max-width: 1240px) {
          .navbar-brand-link .civicai-logo-tagline {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
