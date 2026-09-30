import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Globe, MapPin, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import { useAuth, formatAuthError } from "../../context/AuthContext";
import { useCivicData } from "../../context/CivicDataContext";
import CivicAILogo from "../../components/common/CivicAILogo";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useCivicData();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "Tamil",
    district: "Chennai South"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (form.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Role is strictly fixed to "citizen"
      await register({
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        language: form.preferredLanguage,
        preferredLanguage: form.preferredLanguage,
        district: form.district,
        role: "citizen"
      });

      showToast(`Account created successfully for ${form.fullName}!`, "success");
      navigate("/citizen");
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          background: "radial-gradient(circle at 50% 15%, rgba(37, 99, 235, 0.06) 0%, transparent 60%)"
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "540px",
            width: "100%",
            padding: "2.5rem 2rem",
            boxShadow: "var(--shadow-xl)"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CivicAILogo size={38} showTagline={false} />
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#123B63", marginTop: "1rem", marginBottom: "0.25rem" }}>
              Citizen Registration
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Register to submit and track civic complaints in your locality
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#dc2626",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "1.25rem"
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  required
                  className="input-field"
                  style={{ paddingLeft: "36px" }}
                  placeholder="e.g. Joshua Sheshan"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    required
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    placeholder="name@mail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
                  <input
                    type="tel"
                    required
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    placeholder="+91 98401 23456"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Language & District */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Preferred Language</label>
                <div style={{ position: "relative" }}>
                  <Globe size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)", zIndex: 1 }} />
                  <select
                    className="select-field"
                    style={{ paddingLeft: "36px" }}
                    value={form.preferredLanguage}
                    onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">District / Municipality</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)", zIndex: 1 }} />
                  <select
                    className="select-field"
                    style={{ paddingLeft: "36px" }}
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="Chennai South">Chennai South</option>
                    <option value="Chennai Central">Chennai Central</option>
                    <option value="Chennai North">Chennai North</option>
                    <option value="Coimbatore Urban">Coimbatore Urban</option>
                    <option value="Madurai Metro">Madurai Metro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    required
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    required
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Role Fixed Notice */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                color: "var(--text-secondary)"
              }}
            >
              <ShieldCheck size={16} color="var(--primary)" />
              <span>
                Account Role: <strong>Citizen</strong> (Municipal authority credentials are administrator-provisioned).
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "0.75rem", marginTop: "0.5rem" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Citizen Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
