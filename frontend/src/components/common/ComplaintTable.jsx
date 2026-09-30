import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, Clock, MapPin, Calendar } from "lucide-react";
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
          padding: "3.5rem 1.5rem",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 500 }}>
          No civic complaints registered or matching the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
      <table className="civic-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-medium)" }}>
            <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Complaint ID
            </th>
            <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Category
            </th>
            <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Location
            </th>
            <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Current Status
            </th>
            <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Reported Date
            </th>
            <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Last Updated
            </th>
            {isAuthority && (
              <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
                Severity
              </th>
            )}
            <th style={{ padding: "0.85rem 1rem", textAlign: "right", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((item) => {
            const reportedDate = item.submittedAt
              ? new Date(item.submittedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
              : "Recent";

            const lastUpdated = item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : reportedDate;

            const wardName = item.location?.ward || "Ward 12";
            const address = item.location?.address || "Address Recorded";

            return (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background-color 0.15s ease"
                }}
              >
                {/* 1. Complaint ID */}
                <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
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

                {/* 2. Category */}
                <td style={{ padding: "0.85rem 1rem", maxWidth: "240px" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.875rem" }}>
                    {item.category || "General Civic Issue"}
                  </div>
                  {item.subcategory && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.subcategory}
                    </div>
                  )}
                </td>

                {/* 3. Location */}
                <td style={{ padding: "0.85rem 1rem", maxWidth: "200px" }}>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-main)" }}>
                    {wardName}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={address}
                  >
                    {address}
                  </div>
                </td>

                {/* 4. Current Status */}
                <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                  <StatusBadge status={item.status} size="sm" />
                </td>

                {/* 5. Reported Date */}
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {reportedDate}
                </td>

                {/* 6. Last Updated */}
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {lastUpdated}
                </td>

                {/* Optional Severity for Authority */}
                {isAuthority && (
                  <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                    <SeverityBadge severity={item.severity} />
                  </td>
                )}

                {/* 7. Action */}
                <td style={{ padding: "0.85rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  {isAuthority ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onActionClick && onActionClick(item)}
                      style={{ fontSize: "0.78rem" }}
                    >
                      <Eye size={13} />
                      <span>Review</span>
                    </button>
                  ) : (
                    <Link
                      to={`${linkPrefix}/${item.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
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
