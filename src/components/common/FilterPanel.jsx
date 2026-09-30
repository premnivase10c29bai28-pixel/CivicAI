import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { CIVIC_CATEGORIES, CIVIC_DEPARTMENTS } from "../../data/mockData";

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  showDepartment = true,
  showDistrict = true
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        marginBottom: "1.5rem",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
            Filter Complaints
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onReset}
          style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
        >
          <RotateCcw size={12} />
          Reset Filters
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem"
        }}
      >
        {/* Category */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs text-muted font-medium">Category</label>
          <select
            className="select-field"
            style={{ height: "38px", fontSize: "0.85rem" }}
            value={filters.category || "All"}
            onChange={(e) => onFilterChange("category", e.target.value)}
          >
            <option value="All">All Categories</option>
            {CIVIC_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs text-muted font-medium">Severity</label>
          <select
            className="select-field"
            style={{ height: "38px", fontSize: "0.85rem" }}
            value={filters.severity || "All"}
            onChange={(e) => onFilterChange("severity", e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs text-muted font-medium">Status</label>
          <select
            className="select-field"
            style={{ height: "38px", fontSize: "0.85rem" }}
            value={filters.status || "All"}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Received">Received</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Department */}
        {showDepartment && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted font-medium">Department</label>
            <select
              className="select-field"
              style={{ height: "38px", fontSize: "0.85rem" }}
              value={filters.department || "All"}
              onChange={(e) => onFilterChange("department", e.target.value)}
            >
              <option value="All">All Departments</option>
              {CIVIC_DEPARTMENTS.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* District */}
        {showDistrict && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted font-medium">District / Area</label>
            <select
              className="select-field"
              style={{ height: "38px", fontSize: "0.85rem" }}
              value={filters.district || "All"}
              onChange={(e) => onFilterChange("district", e.target.value)}
            >
              <option value="All">All Districts</option>
              <option value="Chennai South">Chennai South (Wards 12, 18, 21)</option>
              <option value="Chennai Central">Chennai Central (Wards 8, 14)</option>
              <option value="Chennai North">Chennai North (Wards 4, 15)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
