import React from "react";
import { Link } from "react-router-dom";
import { Shield, Info, Heart, Phone, Mail, ExternalLink } from "lucide-react";
import CivicAILogo from "./CivicAILogo";

export default function GovernmentFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#0B2545",
        color: "#E2E8F0",
        borderTop: "3px solid #E88A1A",
        marginTop: "auto"
      }}
    >
      {/* Top Advisory / Transparency Notice */}
      <div
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "1rem 1.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.2)"
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            fontSize: "0.8rem",
            color: "#94A3B8",
            lineHeight: 1.5
          }}
        >
          <Info size={16} color="#E88A1A" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            <strong style={{ color: "#E2E8F0" }}>Decision Support Advisory:</strong> CivicAI is an AI-powered citizen grievance and civic intelligence platform. AI capabilities provide classification and decision support. Designated government authorities remain solely responsible for administrative reviews, verification, dispatch, and final resolutions.
          </span>
        </div>
      </div>

      {/* Main Footer Links */}
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: "2.5rem"
        }}
        className="gov-footer-grid"
      >
        {/* Column 1: Brand & Mission */}
        <div>
          <CivicAILogo inverted size={36} showTagline shortTagline={false} />
          <p
            style={{
              fontSize: "0.825rem",
              color: "#94A3B8",
              lineHeight: 1.6,
              marginTop: "1rem",
              maxWidth: "340px"
            }}
          >
            CivicAI connects citizen reports, verified telemetry, public data, and transparent decision-support tools to accelerate local civic grievance redressal and municipal responsiveness.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "1rem", fontSize: "0.75rem", color: "#CBD5E1" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
            <span>Official Portal Build • Tamil Nadu Municipal Demonstration</span>
          </div>
        </div>

        {/* Column 2: Citizen Services */}
        <div>
          <h4
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#E2E8F0",
              borderBottom: "2px solid #E88A1A",
              display: "inline-block",
              paddingBottom: "4px",
              marginBottom: "1rem"
            }}
          >
            Citizen Services
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.825rem" }}>
            <li>
              <Link to="/citizen/report" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Report a Civic Problem
              </Link>
            </li>
            <li>
              <Link to="/citizen/complaints" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Track Registered Complaint
              </Link>
            </li>
            <li>
              <Link to="/citizen/insights" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Community Civic Insights
              </Link>
            </li>
            <li>
              <Link to="/citizen/profile" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Citizen Profile & Ward Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform & Authorities */}
        <div>
          <h4
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#E2E8F0",
              borderBottom: "2px solid #E88A1A",
              display: "inline-block",
              paddingBottom: "4px",
              marginBottom: "1rem"
            }}
          >
            Authority Portal
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.825rem" }}>
            <li>
              <Link to="/authority" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Municipal Administration Dashboard
              </Link>
            </li>
            <li>
              <Link to="/authority/complaints" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Triage & Complaint Management
              </Link>
            </li>
            <li>
              <Link to="/authority/hotspots" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                Civic Hotspots & GCC Data
              </Link>
            </li>
            <li>
              <Link to="/authority/insights" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                AI Decision Support Advisories
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Trust & Transparency */}
        <div>
          <h4
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#E2E8F0",
              borderBottom: "2px solid #E88A1A",
              display: "inline-block",
              paddingBottom: "4px",
              marginBottom: "1rem"
            }}
          >
            Trust & Governance
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.825rem" }}>
            <li>
              <span style={{ color: "#94A3B8" }}>Data Privacy Policy</span>
            </li>
            <li>
              <span style={{ color: "#94A3B8" }}>Terms of Civic Service</span>
            </li>
            <li>
              <span style={{ color: "#94A3B8" }}>Accessibility Standards (WCAG 2.1)</span>
            </li>
            <li>
              <span style={{ color: "#94A3B8" }}>Open Public Data Attribution (GCC)</span>
            </li>
            <li>
              <span style={{ color: "#94A3B8" }}>Helpline: 1913 (Toll Free)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "1.25rem 1.5rem",
          backgroundColor: "#071B33"
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            fontSize: "0.78rem",
            color: "#64748B"
          }}
        >
          <div>
            © 2026 CivicAI. Built for civic innovation and public-service improvement.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>Indian Civic Portal Design System</span>
            <span>•</span>
            <span>Tamil & English Unicode Support</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .gov-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .gov-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
