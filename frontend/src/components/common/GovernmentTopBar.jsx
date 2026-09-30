import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, HelpCircle, FileText, Search, ExternalLink } from "lucide-react";

/**
 * GovernmentTopBar
 * 
 * Slim, official public-service utility bar displayed atop government portals.
 * Conveys credibility, quick service navigation, and transparency.
 */
export default function GovernmentTopBar({ role = "citizen" }) {
  return (
    <div
      className="gov-topbar"
      style={{
        backgroundColor: "#0B2545",
        color: "#E2E8F0",
        fontSize: "0.75rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "0.35rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
        lineHeight: 1.2
      }}
    >
      {/* Left: Official portal identity statement */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <ShieldCheck size={14} color="#E88A1A" />
        <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>
          CivicAI Public Service Portal
        </span>
        <span style={{ color: "#64748B" }}>|</span>
        <span style={{ color: "#94A3B8" }}>
          AI-Assisted Citizen Grievance & Municipal Intelligence
        </span>
      </div>

      {/* Right: Quick accessibility & navigation links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}
        className="gov-topbar-links"
      >
        <Link
          to={role === "authority" ? "/authority" : "/citizen/report"}
          style={{ color: "#E2E8F0", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <FileText size={12} />
          <span>Report a Problem</span>
        </Link>

        <span style={{ color: "#475569" }}>|</span>

        <Link
          to={role === "authority" ? "/authority/complaints" : "/citizen/complaints"}
          style={{ color: "#E2E8F0", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <Search size={12} />
          <span>Track Complaint</span>
        </Link>

        <span style={{ color: "#475569" }}>|</span>

        <Link
          to={role === "authority" ? "/authority/hotspots" : "/citizen/insights"}
          style={{ color: "#E2E8F0", textDecoration: "none" }}
        >
          Public Information
        </Link>

        <span style={{ color: "#475569" }}>|</span>

        <span style={{ color: "#CBD5E1", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <HelpCircle size={12} color="#E88A1A" />
          <span>Helpline: 1913</span>
        </span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .gov-topbar-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
