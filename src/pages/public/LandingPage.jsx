import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Mic,
  MapPin,
  CheckCircle2,
  Shield,
  Users,
  TrendingUp,
  Brain,
  Layers,
  FileCheck,
  Eye,
  Activity,
  ChevronRight,
  Globe2,
  Lock,
  Building2,
  MessageSquare
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import StatusBadge from "../../components/common/StatusBadge";
import SeverityBadge from "../../components/common/SeverityBadge";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section
        style={{
          padding: "5rem 1.5rem 4rem",
          background: "radial-gradient(ellipse at 50% 20%, rgba(29, 78, 216, 0.08) 0%, transparent 70%)",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "3rem",
            alignItems: "center"
          }}
          className="hero-grid"
        >
          {/* Left Hero Content */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(2, 132, 199, 0.1)",
                border: "1px solid rgba(2, 132, 199, 0.3)",
                color: "var(--ai-accent)",
                fontSize: "0.825rem",
                fontWeight: 600,
                marginBottom: "1.5rem"
              }}
            >
              <Sparkles size={15} />
              <span>Next-Gen AI-Powered Civic Intelligence</span>
            </div>

            <h1
              style={{
                fontSize: "3.25rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "var(--text-main)",
                marginBottom: "1.25rem"
              }}
            >
              Report Problems. <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Improve Communities.
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.2rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "2rem",
                maxWidth: "540px"
              }}
            >
              Turn everyday civic complaints into actionable insights with AI. 
              Multilingual voice, photos, and location-aware triage for rapid urban resolution.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link to="/citizen/report" className="btn btn-primary btn-lg">
                <span>Report a Problem</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/authority" className="btn btn-secondary btn-lg">
                <Shield size={18} />
                <span>Explore CivicAI</span>
              </Link>
            </div>

            {/* Quick Trust badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.75rem",
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: "0.85rem",
                color: "var(--text-muted)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Multilingual (Tamil & English)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Human-in-the-Loop Verified</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Live Civic Intelligence Dashboard Card */}
          <div>
            <div
              className="card"
              style={{
                padding: "1.5rem",
                position: "relative",
                boxShadow: "var(--shadow-xl)",
                borderColor: "rgba(37, 99, 235, 0.25)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#059669"
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Live Civic Triage Stream
                  </span>
                </div>
                <span className="badge badge-ai" style={{ fontSize: "0.75rem" }}>
                  <Sparkles size={11} /> AI-powered analysis • Demo
                </span>
              </div>

              {/* Sample Live Ingestion item */}
              <div
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
                    CIV-2026-00124 (Demo)
                  </span>
                  <SeverityBadge severity="High" />
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  "எங்கள் பகுதியில் ஐந்து நாட்களாக குடிநீர் வரவில்லை."
                </p>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "8px" }}>
                  English: "Drinking water has not been available in our area for 5 days."
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-card)",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "var(--radius-sm)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    fontSize: "0.75rem"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Target Dept: </span>
                    <strong>Water Supply (CMWSSB)</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Location: </span>
                    <strong>Ward 12, Adyar</strong>
                  </div>
                </div>
              </div>

              {/* Meaningful AI analysis info (Demo) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  textAlign: "center"
                }}
              >
                <div style={{ padding: "0.5rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Input Language</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary)" }}>Tamil (தமிழ்)</span>
                </div>
                <div style={{ padding: "0.5rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>AI Triage</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#059669" }}>Water Supply</span>
                </div>
                <div style={{ padding: "0.5rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Verification</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ea580c" }}>Citizen Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. WHAT CIVICAI DOES
          ========================================================================= */}
      <section style={{ padding: "5rem 1.5rem", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Civic Intelligence Engine
          </span>
          <h2 style={{ fontSize: "2.35rem", fontWeight: 800, marginTop: "0.5rem", marginBottom: "1rem" }}>
            What CivicAI Does
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            CivicAI bridges the gap between citizens reporting ground-level issues and municipal authorities managing city infrastructure. 
            Using advanced multimodal AI, complaints are parsed into structured data with zero friction.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div className="card">
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(37, 99, 235, 0.12)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Mic size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Multilingual Citizen Input</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Citizens speak or type in Tamil, English, or regional languages. AI transcribes and translates dialectical nuances accurately.
            </p>
          </div>

          <div className="card">
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(2, 132, 199, 0.12)", color: "var(--ai-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Brain size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Instant AI Triage & Routing</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Instantly detects category, subcategory, urgency, and routes directly to the responsible municipal department (CMWSSB, Roads, Lighting).
            </p>
          </div>

          <div className="card">
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(234, 88, 12, 0.12)", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Hotspot & Trend Detection</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Identifies chronic civic failures, recurring pipe bursts, and localized breakdowns before they spiral into city-wide crises.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS (STEP-BY-STEP)
          ========================================================================= */}
      <section id="how-it-works" style={{ padding: "5rem 1.5rem", backgroundColor: "var(--bg-subtle)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Workflow Architecture
            </span>
            <h2 style={{ fontSize: "2.35rem", fontWeight: 800, marginTop: "0.5rem" }}>
              How CivicAI Works
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              A 4-step verified workflow ensuring transparency and accuracy at every phase.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                step: "01",
                title: "Report Complaint",
                desc: "Citizen describes the issue via voice recording, text description, photo upload, and GPS coordinates in their native language."
              },
              {
                step: "02",
                title: "CivicAI Analyzes",
                desc: "AI extracts category, severity, jurisdiction, municipal department, and summarizes the core problem in seconds."
              },
              {
                step: "03",
                title: "Citizen Confirms",
                desc: "Human-in-the-loop guarantee: the citizen confirms or edits the AI interpretation before official submission."
              },
              {
                step: "04",
                title: "Authority Resolves",
                desc: "Municipal officers receive actionable triage, track resolution SLAs, analyze hotspots, and push verified updates to citizens."
              }
            ].map((s, idx) => (
              <div key={idx} className="card" style={{ padding: "1.75rem", position: "relative" }}>
                <span
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                    opacity: 0.25,
                    lineHeight: 1,
                    marginBottom: "1rem",
                    display: "block"
                  }}
                >
                  {s.step}
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.6rem" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. KEY FEATURES
          ========================================================================= */}
      <section id="features" style={{ padding: "5rem 1.5rem", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
          <h2 style={{ fontSize: "2.35rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Engineered for Modern Governance
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)" }}>
            Purpose-built technology stack designed for high throughput, accessibility, and reliability.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {[
            {
              icon: Globe2,
              title: "Multilingual Voice & Text",
              desc: "Seamless Tamil, English, and regional dialect processing eliminates linguistic barriers for all citizens."
            },
            {
              icon: FileCheck,
              title: "Human-in-the-Loop Verification",
              desc: "Citizens always verify and approve AI interpretations, preventing hallucinations and false dispatches."
            },
            {
              icon: Activity,
              title: "Dynamic Hotspot Clustering",
              desc: "Spatial-temporal machine learning spots localized failures like chronic water shortages or transformer overloads."
            },
            {
              icon: Layers,
              title: "Departmental Auto-Routing",
              desc: "Smart classification matches problems to exact jurisdictional departments (Water, Roads, Power, Sanitation)."
            },
            {
              icon: Eye,
              title: "6-Stage Transparent Tracking",
              desc: "Reported, Received, Under Review, Assigned, In Progress, and Resolved with live official inspector remarks."
            },
            {
              icon: Lock,
              title: "Decision-Support Architecture",
              desc: "Empowers human officers with actionable recommendations without delegating critical governance autonomy to AI."
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                    {f.title}
                  </h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5 & 6. CITIZEN BENEFITS & AUTHORITY BENEFITS
          ========================================================================= */}
      <section id="benefits" style={{ padding: "5rem 1.5rem", backgroundColor: "var(--bg-subtle)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
            <h2 style={{ fontSize: "2.35rem", fontWeight: 800 }}>
              Mutual Value for Citizens & Authorities
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Closing the feedback loop between urban residents and administrative bodies.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="benefits-grid">
            {/* Citizen Benefits */}
            <div className="card" style={{ padding: "2rem", borderTop: "4px solid var(--primary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <Users size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700 }}>For Citizens</h3>
              </div>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  "Report issues in under 60 seconds using voice, photos, and location",
                  "No need to know complex government departments or jurisdiction codes",
                  "Review and edit AI interpretation before submitting",
                  "Real-time 6-stage status tracking and official progress updates",
                  "Discover common civic issues and community updates in your ward"
                ].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.95rem" }}>
                    <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "2rem" }}>
                <Link to="/citizen/report" className="btn btn-primary" style={{ width: "100%" }}>
                  Report Problem as Citizen
                </Link>
              </div>
            </div>

            {/* Authority Benefits */}
            <div className="card" style={{ padding: "2rem", borderTop: "4px solid #7c3aed" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <Building2 size={24} color="#7c3aed" />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700 }}>For Municipal Authorities</h3>
              </div>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  "Auto-categorized complaints delivered straight to responsible departments",
                  "Spatio-temporal hotspot detection identifies repeat infrastructure faults",
                  "Evidence-backed AI decision support with suggested remedial actions",
                  "Real-time civic analytics dashboard with SLA and resolution metrics",
                  "Direct broadcast of official status updates to affected neighborhoods"
                ].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.95rem" }}>
                    <CheckCircle2 size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "2rem" }}>
                <Link to="/authority" className="btn btn-secondary" style={{ width: "100%", borderColor: "#7c3aed", color: "#7c3aed" }}>
                  Launch Authority Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. AI INTELLIGENCE SECTION (DECISION SUPPORT PRINCIPLE)
          ========================================================================= */}
      <section id="ai-intelligence" style={{ padding: "5rem 1.5rem", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
        <div
          className="ai-card"
          style={{
            padding: "3rem",
            background: "linear-gradient(135deg, rgba(29, 78, 216, 0.04) 0%, rgba(2, 132, 199, 0.08) 100%)",
            border: "1px solid rgba(2, 132, 199, 0.3)"
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <span className="badge badge-ai" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", marginBottom: "1rem" }}>
              <Sparkles size={14} /> AI Ethics & Philosophy
            </span>
            <h2 style={{ fontSize: "2.35rem", fontWeight: 800, marginBottom: "1rem" }}>
              Decision Support, Not Autonomous Authority
            </h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "2rem" }}>
              CivicAI is explicitly architected as a <strong>decision-support platform</strong> for human public servants, 
              not an autonomous algorithmic government decision-maker. Every recommendation—from hotspot triage to infrastructure suggestions—is 
              corroborated with empirical citizen reports and requires authorized officer approval before capital dispatch.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", textAlign: "left" }}>
              <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)", marginBottom: "4px" }}>
                  1. Human Confirmation
                </div>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                  Citizens confirm AI categories before complaints are permanently queued.
                </p>
              </div>

              <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)", marginBottom: "4px" }}>
                  2. Officer Accountability
                </div>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                  Status progressions and closures require certified officer authorization.
                </p>
              </div>

              <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)", marginBottom: "4px" }}>
                  3. Transparent Evidence
                </div>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                  AI insights present full cluster data, count, and geographical boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. STATISTICS SECTION
          ========================================================================= */}
      <section style={{ padding: "4rem 1.5rem", backgroundColor: "var(--bg-subtle)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "var(--bg-card)", padding: "4px 14px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)" }}>
              Demo data • Simulated Prototype Metrics
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1.1 }}>
                14,820+
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.4rem" }}>
                Complaints Resolved (Demo)
              </div>
            </div>

            <div>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#059669", lineHeight: 1.1 }}>
                96.4%
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.4rem" }}>
                Citizen Confirmation Rate (Demo)
              </div>
            </div>

            <div>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#7c3aed", lineHeight: 1.1 }}>
                3.2 Days
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.4rem" }}>
                Avg Resolution Time (Demo)
              </div>
            </div>

            <div>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#ea580c", lineHeight: 1.1 }}>
                48 Wards
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.4rem" }}>
                Urban Coverage (Demo)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. CALL TO ACTION
          ========================================================================= */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to Build Better Communities?
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Join thousands of active citizens transforming their neighborhoods with intelligent civic action.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/citizen/report" className="btn btn-primary btn-lg">
              <span>Report a Problem Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Citizen Account
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
          ========================================================================= */}
      <footer
        style={{
          marginTop: "auto",
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border-subtle)",
          padding: "3rem 1.5rem 2rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)"
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2.5rem"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
              <Sparkles size={18} color="var(--primary)" />
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                CivicAI
              </span>
            </div>
            <p style={{ fontSize: "0.825rem", lineHeight: 1.5 }}>
              "AI-powered civic intelligence for better communities"
            </p>
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Hackathon Prototype • Decision-Support Architecture
            </div>
          </div>

          <div>
            <h5 style={{ color: "var(--text-main)", fontWeight: 600, marginBottom: "0.75rem" }}>Citizen Services</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><Link to="/citizen/report">Report a Problem</Link></li>
              <li><Link to="/citizen/complaints">Track My Complaints</Link></li>
              <li><Link to="/citizen/insights">Civic Insights</Link></li>
              <li><Link to="/citizen/profile">Citizen Profile</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: "var(--text-main)", fontWeight: 600, marginBottom: "0.75rem" }}>Authority Console</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><Link to="/authority">Overview Dashboard</Link></li>
              <li><Link to="/authority/complaints">Manage Complaints</Link></li>
              <li><Link to="/authority/map">Civic GIS Map</Link></li>
              <li><Link to="/authority/hotspots">Active Hotspots</Link></li>
              <li><Link to="/authority/analytics">Civic Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: "var(--text-main)", fontWeight: 600, marginBottom: "0.75rem" }}>Civic AI Principles</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>Multilingual Equity</li>
              <li>Human-in-the-Loop Triage</li>
              <li>Transparent Evidence Logs</li>
              <li>Open Community Insights</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8rem"
          }}
        >
          <div>
            © 2026 CivicAI Platform. Designed for Google-style Civic Tech Hackathon.
          </div>
          <div>
            Tamil & English Multilingual Intelligence Support
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
