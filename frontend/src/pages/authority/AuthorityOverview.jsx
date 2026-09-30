import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Building2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import DashboardCard from "../../components/common/DashboardCard";
import ChartCard from "../../components/common/ChartCard";
import ComplaintTable from "../../components/common/ComplaintTable";
import { useCivicData } from "../../context/CivicDataContext";

export default function AuthorityOverview() {
  const { analytics, complaints, hotspots } = useCivicData();

  const { complaintsByCategory, complaintsOverTime, severityDistribution } = analytics;

  const norm = (s) => (s || "").toUpperCase().replace(/\s+/g, "_");

  // Accurate real-time counts from live complaints
  const totalCount = complaints.length;
  const pendingReviewCount = complaints.filter((c) => {
    const s = norm(c.status);
    return s === "REPORTED" || s === "RECEIVED" || s === "UNDER_REVIEW";
  }).length;
  const inProgressCount = complaints.filter((c) => {
    const s = norm(c.status);
    return s === "IN_PROGRESS" || s === "ASSIGNED";
  }).length;
  const resolvedCount = complaints.filter((c) => {
    const s = norm(c.status);
    return s === "RESOLVED";
  }).length;
  const highPriorityCount = complaints.filter((c) => {
    const sev = (c.severity || "").toUpperCase();
    return sev === "HIGH" || sev === "CRITICAL";
  }).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", paddingBottom: "2rem" }}>
      {/* 1. Official Municipal Authority Header Banner */}
      <div
        className="card"
        style={{
          borderLeft: "4px solid var(--primary-navy, #123B63)",
          padding: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Building2 size={20} color="var(--primary)" />
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)" }}>
              Authority Dashboard
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
              Municipal Administration
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", margin: 0 }}>
            Civic grievance triage, field department dispatch, and SLA performance monitoring.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            to="/authority/complaints"
            className="btn btn-primary"
            style={{ backgroundColor: "var(--primary-navy, #123B63)", fontWeight: 600 }}
          >
            <span>Review Complaints</span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/authority/map" className="btn btn-secondary" style={{ fontWeight: 600 }}>
            <MapPin size={15} />
            <span>Civic Issue Map</span>
          </Link>
        </div>
      </div>

      {/* 2. Overview Cards: 5 Government Metrics */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <DashboardCard
          title="Total Complaints"
          value={totalCount}
          subtitle="Cumulative citizen reports"
          icon={FileText}
          accentColor="#123B63"
        />

        <DashboardCard
          title="Pending Review"
          value={pendingReviewCount}
          subtitle="Awaiting officer dispatch"
          icon={Clock}
          accentColor="#B7791F"
          trend="Triage Queue"
        />

        <DashboardCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Field crew mobilized"
          icon={Wrench}
          accentColor="#1769AA"
          trend="Active Operations"
        />

        <DashboardCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Redressal completed"
          icon={CheckCircle2}
          accentColor="#238636"
          trend="Verified Closed"
          trendDirection="up"
        />

        <DashboardCard
          title="High Priority"
          value={highPriorityCount}
          subtitle="Critical & High severity"
          icon={AlertTriangle}
          accentColor="#C53030"
          trend="Immediate Action"
          trendDirection="down"
        />
      </div>

      {/* 3. Official Charts Grid: Complaint Trends, Category Distribution, Severity Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }} className="charts-2col-grid">
        {/* Chart 1: Complaint Trends */}
        <ChartCard
          title="Complaint Trends"
          subtitle="Incoming reports vs resolutions over time"
          height={270}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={complaintsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#123B63" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#123B63" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#238636" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#238636" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "6px",
                  fontSize: "0.8rem"
                }}
              />
              <Legend verticalAlign="top" height={32} iconSize={10} wrapperStyle={{ fontSize: "0.78rem" }} />
              <Area type="monotone" dataKey="complaints" stroke="#123B63" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" name="Incoming" />
              <Area type="monotone" dataKey="resolved" stroke="#238636" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Category Distribution */}
        <ChartCard
          title="Category Distribution"
          subtitle="Complaint volume by civic infrastructure domain"
          height={270}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complaintsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} angle={-15} textAnchor="end" />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "6px",
                  fontSize: "0.8rem"
                }}
              />
              <Bar dataKey="count" fill="#1769AA" radius={[3, 3, 0, 0]}>
                {complaintsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || "#1769AA"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Severity Distribution */}
        <div style={{ gridColumn: "span 2" }} className="chart-full-width">
          <ChartCard
            title="Severity Distribution"
            subtitle="Triage severity classification: Low, Medium, High, Critical"
            height={220}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "6px",
                    fontSize: "0.8rem"
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* 4. Live Incoming Complaints Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
              Recent Incoming Complaints (Live Feed)
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Auto-triaged by CivicAI with verified citizen telemetry
            </p>
          </div>
          <Link to="/authority/complaints" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
            <span>Manage All ({complaints.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <ComplaintTable
          complaints={complaints.slice(0, 6)}
          isAuthority={true}
          linkPrefix="/authority/complaints"
          onActionClick={(item) => window.location.assign(`/authority/complaints?id=${item.id}`)}
        />
      </div>

      <style>{`
        @media (max-width: 960px) {
          .charts-2col-grid { grid-template-columns: 1fr !important; }
          .chart-full-width { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}
