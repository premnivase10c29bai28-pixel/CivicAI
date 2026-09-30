import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, ArrowRight, Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";
import SeverityBadge from "./SeverityBadge";

export default function ComplaintCard({ complaint, linkPrefix = "/citizen/complaints" }) {
  const formattedDate = new Date(complaint.submittedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        padding: "1.25rem",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
    >
      <div>
        {/* Top bar with ID, Status, and Severity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--primary)"
            }}
          >
            {complaint.id}
          </span>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Category & Title */}
        <div style={{ marginBottom: "0.6rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.03em"
            }}
          >
            {complaint.category} • {complaint.subcategory}
          </span>
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginTop: "2px",
              color: "var(--text-main)",
              lineHeight: 1.3
            }}
          >
            {complaint.title || complaint.summary}
          </h4>
        </div>

        {/* AI Summary snippet */}
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
            marginBottom: "0.85rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {complaint.aiAnalysis?.summary || complaint.originalText}
        </p>

        {/* Location & Date details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "0.75rem",
            marginBottom: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={13} color="var(--primary)" />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {complaint.location.address} ({complaint.location.ward})
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={13} />
            <span>{formattedDate}</span>
            {complaint.language && complaint.language !== "English" && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.7rem",
                  backgroundColor: "var(--bg-subtle)",
                  padding: "1px 6px",
                  borderRadius: "4px"
                }}
              >
                {complaint.language}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div>
        <Link
          to={`${linkPrefix}/${complaint.id}`}
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <span>Track Complaint Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
