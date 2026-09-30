import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, Shield, User, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import { useAuth, formatAuthError } from "../../context/AuthContext";
import { useCivicData } from "../../context/CivicDataContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loginAsAuthorityDemo } = useAuth();
  const { showToast } = useCivicData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      const profile = result?.profile;
      const isAuthority = profile?.role === "authority" || 
        email.includes("gov") || 
        email.includes("commissioner") ||
        email.includes("authority");

      showToast("Signed in successfully!", "success");

      if (isAuthority) {
        navigate("/authority");
      } else {
        navigate("/citizen");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo auto-sign in helper
  const handleDemoSignIn = async (demoEmail, demoPassword, name, role, district) => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      let profile;
      try {
        const res = await login(demoEmail, demoPassword);
        profile = res.profile;
      } catch (loginErr) {
        // If demo user does not exist in Firebase Auth yet, auto-provision
        if (
          loginErr.code === "auth/user-not-found" ||
          loginErr.code === "auth/invalid-credential"
        ) {
          const res = await register({
            email: demoEmail,
            password: demoPassword,
            fullName: name,
            phone: "+91 98401 23456",
            district: district || "Chennai South",
            preferredLanguage: "Tamil",
            role: role
          });
          profile = res.profile;
        } else {
          throw loginErr;
        }
      }

      showToast(`Welcome, ${name}!`, "success");
      if (role === "authority") {
        navigate("/authority");
      } else {
        navigate("/citizen");
      }
    } catch (err) {
      console.error("Demo sign-in failed:", err);
      setAuthError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsCitizen = () => {
    handleDemoSignIn(
      "joshua.sheshan@civicai.org",
      "CivicAI@2026",
      "Joshua Sheshan",
      "citizen",
      "Chennai South"
    );
  };

  const handleContinueAsAuthority = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      await loginAsAuthorityDemo();
      showToast("Signed in as Authority Officer (Demo)", "success");
      navigate("/authority");
    } catch (err) {
      console.error("Authority demo sign-in failed:", err);
      setAuthError("Failed to initiate authority demo session.");
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
          background: "radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 60%)"
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "460px",
            width: "100%",
            padding: "2.5rem 2rem",
            boxShadow: "var(--shadow-xl)"
          }}
        >
          {/* Header Branding */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                marginBottom: "1rem"
              }}
            >
              <Sparkles size={24} />
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Welcome to CivicAI</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Sign in to manage and report civic issues
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
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
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  className="input-field"
                  style={{ paddingLeft: "36px" }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 500 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  required
                  className="input-field"
                  style={{ paddingLeft: "36px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleContinueAsCitizen}
              disabled={isSubmitting}
            >
              <User size={16} color="var(--primary)" />
              <span>Continue as Demo Citizen</span>
            </button>
          </form>

          {/* Municipal Authority Authentication Access */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Municipal Officer or Zonal Administrator?
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--primary)", fontSize: "0.825rem", fontWeight: 600 }}
              onClick={handleContinueAsAuthority}
              disabled={isSubmitting}
            >
              <Shield size={14} />
              <span>Sign In with Authority Credentials (Demo)</span>
            </button>
          </div>

          {/* Create Account link */}
          <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password modal simulation */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Reset Password</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Enter your email to receive a password reset link.
            </p>
            <input
              type="email"
              className="input-field"
              value={resetEmail || email}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForgotModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  showToast("Password reset link sent to " + (resetEmail || email), "success");
                  setShowForgotModal(false);
                }}
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
