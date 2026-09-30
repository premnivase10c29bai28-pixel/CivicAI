import React from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ThumbsUp,
  Search,
  ShieldCheck,
  Building2,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import DashboardCard from "../../components/common/DashboardCard";
import ComplaintTable from "../../components/common/ComplaintTable";
import { useCivicData } from "../../context/CivicDataContext";

export default function CitizenDashboard() {
  const { currentUser, complaints, communityIssues, upvoteCommunityIssue } = useCivicData();

  const norm = (s) => (s || "").toUpperCase().replace(/\s+/g, "_");

  // Filter citizen-specific complaints
  const citizenComplaints = complaints.filter(
    (c) => c.userId === currentUser.id || c.submittedBy === currentUser.name || !c.userId
  );

  const totalCount = citizenComplaints.length;

  // Exact government status buckets requested
  const underReviewCount = citizenComplaints.filter((c) => {
    const s = norm(c.status);
    return s === "REPORTED" || s === "RECEIVED" || s === "UNDER_REVIEW";
  }).length;

  const inProgressCount = citizenComplaints.filter((c) => {
    const s = norm(c.status);
    return s === "IN_PROGRESS" || s === "ASSIGNED";
  }).length;

  const resolvedCount = citizenComplaints.filter((c) => {
    const s = norm(c.status);
    return s === "RESOLVED";
  }).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", paddingBottom: "2rem" }}>
      {/* 1. Official Top Welcome Section */}
      <div
        className="card"
        style={{
          borderLeft: "4px solid var(--accent-saffron, #E88A1A)",
          padding: "1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)" }}>
              Welcome to CivicAI
            </h1>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                border: "1px solid var(--primary-border)"
              }}
            >
              Citizen Service Portal
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", lineHeight: 1.45 }}>
            Report local civic issues, track their progress, and help improve your community.
          </p>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Registered Citizen: <strong>{currentUser.name}</strong> • Resident of <strong>{currentUser.ward || "Ward 12"}</strong>, {currentUser.district || "Chennai South"}
          </div>
        </div>

        {/* Primary and Secondary Action CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            to="/citizen/report"
            className="btn btn-primary"
            style={{
              padding: "0.75rem 1.4rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              backgroundColor: "var(--primary-navy, #123B63)"
            }}
          >
            <PlusCircle size={18} />
            <span>+ Report a Civic Problem</span>
          </Link>

          <Link
            to="/citizen/complaints"
            className="btn btn-secondary"
            style={{
              padding: "0.75rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            <Search size={16} />
            <span>Track My Complaints</span>
          </Link>
        </div>
      </div>

      {/* 2. Official Government Statistics Cards */}
      <div className="kpi-grid">
        <DashboardCard
          title="Total Complaints"
          value={totalCount}
          subtitle="Registered in your profile"
          icon={FileText}
          accentColor="#123B63"
        />

        <DashboardCard
          title="Under Review"
          value={underReviewCount}
          subtitle="Awaiting administrative triage"
          icon={Clock}
          accentColor="#B7791F"
          trend="Pending Verification"
        />

        <DashboardCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Assigned to department crew"
          icon={TrendingUp}
          accentColor="#1769AA"
          trend="Field Work Active"
        />

        <DashboardCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Fixed by civic authorities"
          icon={CheckCircle2}
          accentColor="#238636"
          trend="Redressal Complete"
          trendDirection="up"
        />
      </div>

      {/* 3. Main Dashboard Grid: Recent Complaints + Community Telemetry */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.85fr", gap: "1.75rem" }} className="dashboard-content-grid">
        {/* Left Column: Recent Complaints Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem"
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
                Recent Complaints
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Live updates on complaints submitted through this citizen account
              </p>
            </div>
            <Link
              to="/citizen/complaints"
              style={{
                fontSize: "0.85rem",
                color: "var(--primary)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>View All ({citizenComplaints.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <ComplaintTable
            complaints={citizenComplaints.slice(0, 5)}
            linkPrefix="/citizen/complaints"
          />
        </div>

        {/* Right Column: Community Issues & Public Assistance Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Ward Community Reports */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                  Community Issues in {currentUser.ward || "Ward 12"}
                </h3>
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  backgroundColor: "var(--bg-subtle)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                Local Telemetry
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {communityIssues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", marginBottom: "2px" }}>
                      {issue.category} • {issue.reportedAgo}
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", lineHeight: 1.35 }}>
                      {issue.title}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => upvoteCommunityIssue(issue.id)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.75rem",
                      padding: "0.3rem 0.6rem"
                    }}
                    title="Upvote issue to increase priority"
                  >
                    <ThumbsUp size={12} />
                    <span>{issue.upvotes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Public Service Assistance Card */}
          <div
            className="card"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-medium)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.6rem" }}>
              <HelpCircle size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                Municipal Service Support
              </h3>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.85rem" }}>
              Need immediate emergency civic escalation? Greater Chennai Corporation toll-free helpline operates 24/7 for urgent road safety, fallen trees, and water contamination.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 0.85rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.8rem",
                fontWeight: 600
              }}
            >
              <span>GCC Civic Helpline</span>
              <span style={{ color: "var(--primary)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                📞 1913
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .dashboard-content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
