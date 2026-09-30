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
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import DashboardCard from "../../components/common/DashboardCard";
import ComplaintTable from "../../components/common/ComplaintTable";
import { useCivicData } from "../../context/CivicDataContext";

export default function CitizenDashboard() {
  const { currentUser, complaints, communityIssues, upvoteCommunityIssue } = useCivicData();

  const norm = (s) => (s || "").toUpperCase().replace(/\s+/g, "_");

  // Citizen-specific stats
  const citizenComplaints = complaints.filter(
    (c) => c.userId === currentUser.id || c.submittedBy === currentUser.name || !c.userId
  );

  const totalCount = citizenComplaints.length;
  const openCount = citizenComplaints.filter((c) => {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Banner / Welcome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
          padding: "1.5rem",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.5rem" }}>👋</span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
              Good afternoon, {(currentUser.name || "Citizen").split(" ")[0]}
            </h2>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "2px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontWeight: 600 }}>
              Citizen Portal
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {currentUser.ward || "Ward 12"}, {currentUser.district || "Chennai South"} • Live CivicAI citizen session.
          </p>
        </div>

        {/* Quick Action: Report a Problem */}
        <Link to="/citizen/report" className="btn btn-primary btn-lg">
          <PlusCircle size={20} />
          <span>Report a Problem</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <DashboardCard
          title="Total Complaints"
          value={totalCount}
          subtitle="Submitted by you (Demo)"
          icon={FileText}
          accentColor="#2563eb"
        />

        <DashboardCard
          title="Open Complaints"
          value={openCount + inProgressCount}
          subtitle={`${inProgressCount} in active progress`}
          icon={Clock}
          accentColor="#f59e0b"
          trend={`${openCount} pending review`}
          trendDirection="up"
        />

        <DashboardCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Fixed by civic authorities"
          icon={CheckCircle2}
          accentColor="#059669"
          trend="Addressed (Demo)"
          trendDirection="up"
        />

        <DashboardCard
          title="Community Issues"
          value={communityIssues.length}
          subtitle={`Near ${currentUser.ward}`}
          icon={Users}
          accentColor="#7c3aed"
          trend="+12 this week"
          trendDirection="up"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: "1.75rem" }} className="dashboard-content-grid">
        {/* Left Column: Recent Complaints */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem"
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Your Recent Complaints
            </h3>
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

        {/* Right Column: Community Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Common Problems in your area */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} color="var(--primary)" />
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                  Common Issues in {currentUser.ward}
                </h4>
              </div>
              <span className="badge badge-ai" style={{ fontSize: "0.7rem" }}>
                <Sparkles size={11} /> AI Area Clustered
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
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
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)", marginBottom: "2px" }}>
                      {issue.category} • {issue.reportedAgo}
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", lineHeight: 1.3 }}>
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
                    title="Upvote issue to elevate priority"
                  >
                    <ThumbsUp size={12} />
                    <span>{issue.upvotes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Local AI Insights Card */}
          <div
            className="ai-card"
            style={{
              padding: "1.25rem",
              background: "linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.6rem" }}>
              <Sparkles size={16} color="var(--ai-accent)" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                Neighborhood Civic Pulse
              </h4>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.85rem" }}>
              Water infrastructure repairs are currently active in Ward 12. CMWSSB has deployed 2 emergency drinking water tankers to Kasturba Nagar 4th Cross.
            </p>
            <Link
              to="/citizen/insights"
              style={{
                fontSize: "0.8rem",
                color: "var(--primary)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>Explore Ward 12 Civic Analytics</span>
              <ArrowRight size={13} />
            </Link>
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
