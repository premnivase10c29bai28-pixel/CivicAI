import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, MoreHorizontal, Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";
import SeverityBadge from "./SeverityBadge";

export default function ComplaintTable({
  complaints,
  isAuthority = false,
  onActionClick,
  linkPrefix = "/citizen/complaints"
}) {
  if (!complaints || complaints.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem 1.5rem",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          No complaints match the selected filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="civic-table">
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Category & Issue</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Date</th>
            {isAuthority && <th>Department</th>}
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((item) => {
            const formattedDate = new Date(item.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <tr key={item.id}>
                {/* ID with mono font */}
                <td>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    {item.id}
                  </span>
                </td>

                {/* Category & Title */}
                <td style={{ maxWidth: "260px" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.title || item.category}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {item.category} • {item.subcategory}
                  </div>
                </td>

                {/* Location */}
                <td>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {item.location.ward}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      maxWidth: "180px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {item.location.address}
                  </div>
                </td>

                {/* Severity */}
                <td>
                  <SeverityBadge severity={item.severity} />
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={item.status} size="sm" />
                </td>

                {/* Date */}
                <td style={{ fontSize: "0.825rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {formattedDate}
                </td>

                {/* Department (Authority mode) */}
                {isAuthority && (
                  <td style={{ fontSize: "0.825rem", color: "var(--text-secondary)", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.department}
                  </td>
                )}

                {/* Action button */}
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {isAuthority ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onActionClick && onActionClick(item)}
                      style={{ fontSize: "0.78rem" }}
                    >
                      <Eye size={13} />
                      Manage
                    </button>
                  ) : (
                    <Link
                      to={`${linkPrefix}/${item.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: "0.78rem" }}
                    >
                      <span>Track</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
