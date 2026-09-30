import React, { useState } from "react";
import { Shield, Settings, Sliders, Moon, Sun, Bell, Save, CheckCircle2, Building2 } from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";
import { useTheme } from "../../context/ThemeContext";

export default function AuthoritySettingsPage() {
  const { currentUser, showToast } = useCivicData();
  const { theme, toggleTheme } = useTheme();

  const [hotspotThreshold, setHotspotThreshold] = useState(15);
  const [urgencyWeight, setUrgencyWeight] = useState(85);
  const [autoRouting, setAutoRouting] = useState(true);
  const [escalateSlaHours, setEscalateSlaHours] = useState(48);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast("Authority configuration rules saved to municipal registry", "success");
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "3rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Authority System Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Configure AI triage thresholds, jurisdictional routing rules, and commissioner credentials
        </p>
      </div>

      {/* Commissioner Profile Details */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              fontWeight: 800
            }}
          >
            K
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{currentUser.name}</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {currentUser.designation} • Badge: <strong>{currentUser.badgeNumber || "TN-MC-2026-88"}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "var(--bg-subtle)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Email Jurisdiction</span>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{currentUser.email}</div>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Control Region</span>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Greater Municipal Region (48 Wards)</div>
          </div>
        </div>
      </div>

      {/* AI Triage & Hotspot Rule Configuration */}
      <form onSubmit={handleSaveSettings} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
          <Sliders size={18} color="var(--primary)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            AI Pattern & Hotspot Detection Rules
          </h3>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span>Hotspot Cluster Trigger Threshold ({hotspotThreshold} Complaints)</span>
            <span className="text-xs text-muted">Radius: 500 meters within 7 days</span>
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={hotspotThreshold}
            onChange={(e) => setHotspotThreshold(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--primary)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>5 (Hyper-sensitive)</span>
            <span>15 (Balanced Default)</span>
            <span>40 (High tolerance)</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span>Critical Severity Escalation SLA ({escalateSlaHours} Hours)</span>
            <span className="text-xs text-muted">Automated notification to Zonal Commissioner if unresolved</span>
          </label>
          <select
            className="select-field"
            value={escalateSlaHours}
            onChange={(e) => setEscalateSlaHours(Number(e.target.value))}
          >
            <option value={24}>24 Hours (Immediate Rapid Protocol)</option>
            <option value={48}>48 Hours (Standard Civic SLA)</option>
            <option value={72}>72 Hours (Extended Infrastructure SLA)</option>
          </select>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={autoRouting}
            onChange={(e) => setAutoRouting(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
          />
          <div>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Enable Automated AI Department Dispatch</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
              Complaints verified by citizens are queued directly in department queues without manual sorting
            </span>
          </div>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            <span>Save System Parameters</span>
          </button>
        </div>
      </form>

      {/* Theme Setting */}
      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Appearance & Contrast
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Configure dashboard color profile for high ambient light or night operations
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {theme === "dark" ? <Moon size={20} color="#60a5fa" /> : <Sun size={20} color="#f59e0b" />}
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                Current Theme: <strong>{theme === "dark" ? "Dark Mode" : "Light Mode"}</strong>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Government-standard accessible visual hierarchy
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleTheme}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>
    </div>
  );
}
