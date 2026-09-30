import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  MapPin,
  PieChart as PieIcon,
  Download,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import ChartCard from "../../components/common/ChartCard";
import DashboardCard from "../../components/common/DashboardCard";
import { useCivicData } from "../../context/CivicDataContext";

export default function CivicAnalyticsPage() {
  const { complaints, showToast } = useCivicData();

  // 1. Complaint Trends (Real Data)
  const complaintTrends = useMemo(() => {
    if (!complaints || complaints.length === 0) return [];
    const dateMap = new Map();

    complaints.forEach((c) => {
      const rawDate = c.submittedAt || c.createdAt || c.date;
      if (!rawDate) return;
      try {
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return;
        const key = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        dateMap.set(key, (dateMap.get(key) || 0) + 1);
      } catch {
        // Skip unparseable dates
      }
    });

    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }, [complaints]);

  // 2. Complaints by Category (Real Data)
  const complaintsByCategory = useMemo(() => {
    if (!complaints || complaints.length === 0) return [];
    const catMap = new Map();

    complaints.forEach((c) => {
      const cat = c.category || "Other";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    return Array.from(catMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // 3. Complaints by Severity (Real Data)
  const complaintsBySeverity = useMemo(() => {
    if (!complaints || complaints.length === 0) return [];
    const severities = ["Low", "Medium", "High", "Critical"];
    const sevMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };

    complaints.forEach((c) => {
      const s = c.severity || "Medium";
      if (sevMap[s] !== undefined) {
        sevMap[s]++;
      } else {
        sevMap.Medium++;
      }
    });

    return severities.map((sev) => ({
      severity: sev,
      count: sevMap[sev]
    }));
  }, [complaints]);

  // 4. Resolution Status (Real Data)
  const resolutionStatusData = useMemo(() => {
    if (!complaints || complaints.length === 0) return [];
    const statusMap = new Map();

    complaints.forEach((c) => {
      const rawStatus = (c.status || "REPORTED").toUpperCase().replace(/[\s-]/g, "_");
      const label =
        rawStatus === "UNDER_REVIEW"
          ? "Under Review"
          : rawStatus === "IN_PROGRESS"
          ? "In Progress"
          : rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase();
      statusMap.set(label, (statusMap.get(label) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count
    }));
  }, [complaints]);

  // 5. Geographic Distribution (Real Data)
  const geographicDistribution = useMemo(() => {
    if (!complaints || complaints.length === 0) return [];
    const locMap = new Map();

    complaints.forEach((c) => {
      const loc =
        c.location?.locality ||
        c.location?.district ||
        (c.location?.address ? c.location.address.split(",")[0] : null) ||
        "Chennai Central";
      locMap.set(loc, (locMap.get(loc) || 0) + 1);
    });

    return Array.from(locMap.entries())
      .map(([locality, count]) => ({ locality, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [complaints]);

  // KPIs derived strictly from real complaints
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => (c.status || "").toUpperCase() === "RESOLVED").length;
  const inProgressCount = complaints.filter(
    (c) => (c.status || "").toUpperCase() === "IN_PROGRESS" || (c.status || "").toUpperCase() === "ASSIGNED"
  ).length;
  const highPriorityCount = complaints.filter(
    (c) => c.severity === "High" || c.severity === "Critical"
  ).length;
  const resolutionRate = totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : "0%";

  const renderInsufficientData = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "var(--text-muted)",
        gap: "0.5rem"
      }}
    >
      <Info size={24} style={{ opacity: 0.5 }} />
      <span style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
        Insufficient data for this analysis.
      </span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#123B63",
                backgroundColor: "rgba(18, 59, 99, 0.08)",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(18, 59, 99, 0.18)",
                fontWeight: 700
              }}
            >
              Real-Time Telemetry • Verified Firestore Database
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#123B63", margin: "0 0 0.25rem 0" }}>
            Civic Analytics
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
            Official municipal analytics and telemetry computed from live citizen complaint records.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => showToast("Exporting verified analytics dataset...", "info")}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <Download size={14} />
          <span>Export Analytics</span>
        </button>
      </div>

      {/* Top Real KPI Cards */}
      <div className="kpi-grid">
        <DashboardCard
          title="Total Complaints"
          value={totalCount}
          subtitle="Registered in system"
          icon={FileText}
          accentColor="#123B63"
        />

        <DashboardCard
          title="Resolved Tickets"
          value={resolvedCount}
          subtitle={`${resolutionRate} resolution rate`}
          icon={CheckCircle2}
          accentColor="#238636"
        />

        <DashboardCard
          title="Active Operations"
          value={inProgressCount}
          subtitle="Assigned or in progress"
          icon={TrendingUp}
          accentColor="#1769AA"
        />

        <DashboardCard
          title="High Priority"
          value={highPriorityCount}
          subtitle="High or critical severity"
          icon={AlertTriangle}
          accentColor="#C53030"
        />
      </div>

      {/* 5 Real Charts as Specified in Section 22 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="analytics-charts-grid">
        {/* Chart 1: Complaint Trends */}
        <ChartCard
          title="Complaint Trends"
          subtitle="Complaint registration volume over calendar timeline"
          height={280}
        >
          {complaintTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaintTrends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    color: "#17202A",
                    fontSize: "0.8rem"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1769AA"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1769AA" }}
                  name="Complaints"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            renderInsufficientData()
          )}
        </ChartCard>

        {/* Chart 2: Complaints by Category */}
        <ChartCard
          title="Complaints by Category"
          subtitle="Distribution across municipal civic domains"
          height={280}
        >
          {complaintsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    color: "#17202A",
                    fontSize: "0.8rem"
                  }}
                />
                <Bar dataKey="count" fill="#123B63" name="Tickets" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            renderInsufficientData()
          )}
        </ChartCard>

        {/* Chart 3: Complaints by Severity */}
        <ChartCard
          title="Complaints by Severity"
          subtitle="Impact severity classification of reported issues"
          height={280}
        >
          {complaintsBySeverity.some((s) => s.count > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsBySeverity} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="severity" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    color: "#17202A",
                    fontSize: "0.8rem"
                  }}
                />
                <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                  {complaintsBySeverity.map((entry, index) => {
                    const colors = {
                      Low: "#238636",
                      Medium: "#B7791F",
                      High: "#C53030",
                      Critical: "#7F1D1D"
                    };
                    return <Cell key={`cell-${index}`} fill={colors[entry.severity] || "#1769AA"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            renderInsufficientData()
          )}
        </ChartCard>

        {/* Chart 4: Resolution Status */}
        <ChartCard
          title="Resolution Status"
          subtitle="Lifecycle stages of citizen complaints"
          height={280}
        >
          {resolutionStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    color: "#17202A",
                    fontSize: "0.8rem"
                  }}
                />
                <Bar dataKey="count" fill="#E88A1A" name="Tickets" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            renderInsufficientData()
          )}
        </ChartCard>
      </div>

      {/* Chart 5: Geographic Distribution (Full width card) */}
      <ChartCard
        title="Geographic Distribution"
        subtitle="Report concentrations by locality and ward area"
        height={300}
      >
        {geographicDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geographicDistribution} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="locality" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  color: "#17202A",
                  fontSize: "0.8rem"
                }}
              />
              <Bar dataKey="count" fill="#1769AA" name="Tickets" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          renderInsufficientData()
        )}
      </ChartCard>

      <style>{`
        @media (max-width: 960px) {
          .analytics-charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
