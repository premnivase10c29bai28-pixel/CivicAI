import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, LayoutGrid, Table as TableIcon, Filter, Search } from "lucide-react";
import ComplaintTable from "../../components/common/ComplaintTable";
import ComplaintCard from "../../components/common/ComplaintCard";
import SearchBar from "../../components/common/SearchBar";
import EmptyState from "../../components/common/EmptyState";
import { useCivicData } from "../../context/CivicDataContext";

export default function MyComplaintsPage() {
  const { currentUser, complaints } = useCivicData();
  const [statusFilter, setStatusFilter] = useState("All"); // All | Open | In Progress | Resolved | Rejected
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'

  const norm = (s) => (s || "").toUpperCase().replace(/\s+/g, "_");

  // Citizen-specific complaints
  const myComplaints = useMemo(() => {
    return complaints.filter((c) => {
      return c.userId === currentUser.id || c.submittedBy === currentUser.name || !c.userId;
    });
  }, [complaints, currentUser]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return myComplaints.filter((item) => {
      const s = norm(item.status);
      // Status matching
      if (statusFilter === "Open") {
        if (!["REPORTED", "RECEIVED", "UNDER_REVIEW"].includes(s)) return false;
      } else if (statusFilter === "In Progress") {
        if (!["IN_PROGRESS", "ASSIGNED"].includes(s)) return false;
      } else if (statusFilter === "Resolved") {
        if (s !== "RESOLVED") return false;
      } else if (statusFilter === "Rejected") {
        if (s !== "REJECTED") return false;
      }

      // Search matching
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = (item.id || item.complaintId || "").toLowerCase().includes(q);
        const matchesCat = (item.category || "").toLowerCase().includes(q);
        const addr = item.location?.address || "";
        const ward = item.location?.ward || "";
        const matchesLoc = addr.toLowerCase().includes(q) || ward.toLowerCase().includes(q);
        const matchesText =
          (item.title || "").toLowerCase().includes(q) ||
          (item.summary || "").toLowerCase().includes(q) ||
          (item.description || item.originalText || "").toLowerCase().includes(q);
        if (!matchesId && !matchesCat && !matchesLoc && !matchesText) return false;
      }

      return true;
    });
  }, [myComplaints, statusFilter, searchTerm]);

  const tabs = [
    { label: "All", count: myComplaints.length },
    {
      label: "Open",
      count: myComplaints.filter((c) => ["REPORTED", "RECEIVED", "UNDER_REVIEW"].includes(norm(c.status))).length
    },
    {
      label: "In Progress",
      count: myComplaints.filter((c) => ["IN_PROGRESS", "ASSIGNED"].includes(norm(c.status))).length
    },
    {
      label: "Resolved",
      count: myComplaints.filter((c) => norm(c.status) === "RESOLVED").length
    },
    {
      label: "Rejected",
      count: myComplaints.filter((c) => norm(c.status) === "REJECTED").length
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>My Complaints</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Monitor real-time status and historical updates of your submitted civic issues
          </p>
        </div>

        <Link to="/citizen/report" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.25rem",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        {/* Status Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "4px"
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`btn btn-sm ${statusFilter === tab.label ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setStatusFilter(tab.label)}
              style={{ borderRadius: "var(--radius-full)", padding: "0.35rem 0.9rem" }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  backgroundColor: statusFilter === tab.label ? "rgba(255, 255, 255, 0.25)" : "var(--bg-subtle)",
                  color: statusFilter === tab.label ? "#ffffff" : "var(--text-muted)",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-full)"
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <SearchBar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Search by ID, keyword, Tamil/English phrases, or location..."
          />

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              type="button"
              className={`btn-icon ${viewMode === "table" ? "active" : ""}`}
              style={{
                backgroundColor: viewMode === "table" ? "var(--bg-subtle)" : "transparent",
                color: viewMode === "table" ? "var(--primary)" : "var(--text-secondary)"
              }}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <TableIcon size={18} />
            </button>
            <button
              type="button"
              className={`btn-icon ${viewMode === "cards" ? "active" : ""}`}
              style={{
                backgroundColor: viewMode === "cards" ? "var(--bg-subtle)" : "transparent",
                color: viewMode === "cards" ? "var(--primary)" : "var(--text-secondary)"
              }}
              onClick={() => setViewMode("cards")}
              title="Card Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints match your filters"
          description="Try adjusting your status filter or clearing your search term."
          actionLabel="Report a Problem"
          onAction={() => window.location.assign("/citizen/report")}
        />
      ) : viewMode === "table" ? (
        <ComplaintTable
          complaints={filteredComplaints}
          linkPrefix="/citizen/complaints"
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredComplaints.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              linkPrefix="/citizen/complaints"
            />
          ))}
        </div>
      )}
    </div>
  );
}
