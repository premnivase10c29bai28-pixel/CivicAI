import React from "react";
import { Sparkles, MapPin, ThumbsUp, AlertCircle, TrendingUp, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import ChartCard from "../../components/common/ChartCard";
import InsightCard from "../../components/common/InsightCard";
import { useCivicData } from "../../context/CivicDataContext";

export default function CitizenInsightsPage() {
  const { currentUser, insights, communityIssues, upvoteCommunityIssue } = useCivicData();

  const wardCategoryData = [
    { name: "Water", complaints: 42 },
    { name: "Drainage", complaints: 28 },
    { name: "Roads", complaints: 19 },
    { name: "Lighting", complaints: 14 },
    { name: "Sanitation", complaints: 11 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.4rem" }}>
          <span className="badge badge-ai">
            <Sparkles size={12} /> Local Civic Intelligence
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Zone: {currentUser.ward}, {currentUser.district}
          </span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Community Civic Insights
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Understand infrastructure patterns, ongoing civic maintenance, and community priorities in your ward.
        </p>
      </div>

      {/* Top Highlight Banner */}
      <div
        className="ai-card"
        style={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(2, 132, 199, 0.05) 100%)",
          padding: "1.75rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
          <Activity size={20} color="var(--primary)" />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Ward 12 Infrastructure Advisory
          </h3>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.6, marginBottom: "1rem" }}>
          CivicAI has correlated 42 recent water complaints to a sub-feeder pipeline valve breakdown on 4th Cross Road. 
          The Water Supply Board (CMWSSB) has scheduled pipeline replacement and deployed temporary water tankers across Adyar.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>Resolution ETA: <strong>Under 36 Hours</strong></span>
          <span>•</span>
          <span>Affected Households: <strong>~18,500</strong></span>
          <span>•</span>
          <span>Telemetry Status: <strong>Crew Alpha Mobilized</strong></span>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.75rem" }} className="insights-grid">
        {/* Left: Ward Analytics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <ChartCard
            title={`Top Problem Categories in ${currentUser.ward}`}
            subtitle="Frequency of reported complaints in the past 30 days"
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "8px",
                    color: "var(--text-main)"
                  }}
                />
                <Bar dataKey="complaints" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Active AI Insights for this area */}
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>
              Active AI Pattern Insights
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {insights.slice(0, 2).map((item) => (
                <InsightCard key={item.id} insight={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Community Issues */}
        <div>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Community Voting & Priorities
                </h3>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Upvoted by residents
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {communityIssues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)" }}>
                      {issue.category} • {issue.ward}
                    </span>
                    <span className="badge badge-progress" style={{ fontSize: "0.7rem" }}>
                      {issue.status}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", lineHeight: 1.4 }}>
                    {issue.title}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Reported {issue.reportedAgo}
                    </span>
                    <button
                      type="button"
                      onClick={() => upvoteCommunityIssue(issue.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.8rem", gap: "6px" }}
                    >
                      <ThumbsUp size={13} color="var(--primary)" />
                      <span>{issue.upvotes} Upvotes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .insights-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
