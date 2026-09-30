import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Shield, User, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import { useAuth, formatAuthError } from "../../context/AuthContext";
import { useCivicData } from "../../context/CivicDataContext";
import CivicAILogo from "../../components/common/CivicAILogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useCivicData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      const profile = await login(email, password);
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
        profile = await login(demoEmail, demoPassword);
      } catch (loginErr) {
        // If demo user does not exist in Firebase Auth yet, auto-provision
        if (
          loginErr.code === "auth/user-not-found" ||
          loginErr.code === "auth/invalid-credential"
        ) {
          profile = await register({
            email: demoEmail,
            password: demoPassword,
            fullName: name,
            phone: "+91 98401 23456",
            district: district || "Chennai South",
            preferredLanguage: "Tamil",
            role: role
          });
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

  const handleContinueAsAuthority = () => {
    handleDemoSignIn(
      "commissioner@chennaicorporation.gov.in",
      "Authority@2026",
      "Dr. J. Radhakrishnan, IAS",
      "authority",
      "Chennai Metro"
    );
  };

  return (
    <div
      className="login-page-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-page)",
        overflowX: "hidden"
      }}
    >
      {/* Official Navigation Header */}
      <Navbar />

      {/* Main Viewport Centering Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.75rem 1rem",
          boxSizing: "border-box",
          width: "100%"
        }}
      >
        <div
          className="login-card-container"
          style={{
            width: "100%",
            maxWidth: "460px",
            margin: "0 auto",
            boxSizing: "border-box"
          }}
        >
          <div
            className="card login-card"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "2rem 2.25rem",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card)",
              boxShadow: "0 4px 20px rgba(18, 59, 99, 0.08)"
            }}
          >
            {/* Header Branding */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  width: "100%"
                }}
              >
                <CivicAILogo size={38} showTagline={false} />
              </div>
              <h1
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--primary-navy, #123B63)",
                  margin: "0 0 0.35rem 0",
                  textAlign: "center"
                }}
              >
                Citizen &amp; Official Sign In
              </h1>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  margin: 0,
                  textAlign: "center"
                }}
              >
                Access the CivicAI civic services and grievance portal
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div
                role="alert"
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
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)", pointerEvents: "none" }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
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
                <div className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--primary-blue, #1769AA)",
                      fontWeight: 500,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)", pointerEvents: "none" }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="input-field"
                    style={{ paddingLeft: "36px", paddingRight: "40px" }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                      borderRadius: "4px"
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.75rem", justifyContent: "center" }}
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
                <User size={16} color="var(--primary-blue, #1769AA)" />
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
                style={{
                  color: "var(--primary-blue, #1769AA)",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "center"
                }}
                onClick={handleContinueAsAuthority}
                disabled={isSubmitting}
              >
                <Shield size={14} />
                <span>Sign In with Authority Credentials (Demo)</span>
              </button>
            </div>

            {/* Create Account link */}
            <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--primary-blue, #1769AA)", fontWeight: 600, textDecoration: "none" }}>
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Slim Official Footer */}
      <footer
        style={{
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-header)",
          textAlign: "center",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          flexShrink: 0
        }}
      >
        <span>CivicAI Official Grievance &amp; Civic Intelligence Portal • Helpline: 1913</span>
      </footer>

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
              autoFocus
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

      <style>{`
        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}
