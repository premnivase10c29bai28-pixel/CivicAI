import React, { useState, useEffect } from "react";
import { User, Globe, Moon, Sun, Bell, Shield, Save, Check, Loader2 } from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function CitizenProfilePage() {
  const { currentUser, setCurrentUser, showToast } = useCivicData();
  const { userProfile, updateUserProfileData } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    name: userProfile?.name || currentUser.name || "Citizen User",
    email: userProfile?.email || currentUser.email || "",
    phone: userProfile?.phone || currentUser.phone || "+91 98401 23456",
    district: userProfile?.district || currentUser.district || "Chennai South",
    ward: userProfile?.ward || currentUser.ward || "Ward 12",
    preferredLanguage: userProfile?.language || currentUser.preferredLanguage || "Tamil"
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || currentUser.name || "Citizen User",
        email: userProfile.email || currentUser.email || "",
        phone: userProfile.phone || currentUser.phone || "+91 98401 23456",
        district: userProfile.district || currentUser.district || "Chennai South",
        ward: userProfile.ward || currentUser.ward || "Ward 12",
        preferredLanguage: userProfile.language || currentUser.preferredLanguage || "Tamil"
      });
    }
  }, [userProfile]);

  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    emailDigest: true,
    statusUpdates: true,
    hotspotWarnings: false
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (updateUserProfileData) {
        await updateUserProfileData({
          name: form.name,
          phone: form.phone,
          district: form.district,
          ward: form.ward,
          language: form.preferredLanguage
        });
      }

      setCurrentUser({
        ...currentUser,
        ...form
      });

      showToast("Profile settings saved successfully to Firestore", "success");
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("Error updating profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "3rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Profile & Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Manage your personal information, language, theme, and notification preferences
        </p>
      </div>

      {/* Profile Info Card */}
      <form onSubmit={handleSaveProfile} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 800
            }}
          >
            {form.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{form.name}</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Registered Citizen • {form.district}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="profile-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Preferred Language</label>
            <select
              className="select-field"
              value={form.preferredLanguage}
              onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
            >
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">District</label>
            <select
              className="select-field"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            >
              <option value="Chennai South">Chennai South</option>
              <option value="Chennai Central">Chennai Central</option>
              <option value="Chennai North">Chennai North</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ward / Locality</label>
            <input
              type="text"
              className="input-field"
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Theme Card */}
      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Appearance & Theme
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Switch between Light Mode and Dark Mode interface
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {theme === "dark" ? <Moon size={20} color="#60a5fa" /> : <Sun size={20} color="#f59e0b" />}
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                Current Theme: <strong>{theme === "dark" ? "Dark Mode" : "Light Mode"}</strong>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Optimized for high-contrast accessibility
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

      {/* Notification Preferences */}
      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Notification Preferences
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          Select how you want to be alerted on complaint milestones
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { key: "statusUpdates", label: "Complaint Status Progression", desc: "Receive immediate updates when an officer updates or resolves your complaint" },
            { key: "smsAlerts", label: "SMS Alerts", desc: "Send critical dispatches and OTP receipts to your mobile phone" },
            { key: "emailDigest", label: "Weekly Civic Summary Digest", desc: "Weekly email recap of resolved community problems in your ward" },
            { key: "hotspotWarnings", label: "Localized Hotspot Warnings", desc: "Advisories for power cuts, major water pipe maintenance, and road repairs" }
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                padding: "0.5rem 0"
              }}
            >
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={(e) => {
                  setNotifications({ ...notifications, [item.key]: e.target.checked });
                  showToast("Notification preference updated", "info");
                }}
                style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "var(--primary)" }}
              />
              <div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", display: "block" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {item.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
