import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import { useCivicData } from "../../context/CivicDataContext";

export default function InsightCard({ insight }) {
  const { showToast } = useCivicData();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAction = () => {
    setAcknowledged(true);
    showToast(`Decision Support Action initiated for ${insight.area}: Field crew notification queued.`, "success");
  };

  return (
    <div
      className="card"
      style={{
        position: "relative",
        borderLeft: insight.severity === "Critical" 
          ? "4px solid #dc2626" 
          : "4px solid #0284c7",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        {/* Header with AI indicator and Area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.85rem",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-ai">
              <Sparkles size={11} /> AI Decision Support • Demo
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-subtle)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)"
              }}
            >
              {insight.area}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: insight.trendDirection === "up" ? "#ea580c" : "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              <TrendingUp size={13} />
              {insight.trend}
            </span>
            <SeverityBadge severity={insight.severity} />
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--text-main)",
            marginBottom: "0.5rem"
          }}
        >
          {insight.title}
        </h3>

        {/* Evidence callout */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "0.6rem 0.85rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.825rem",
            marginBottom: "0.85rem",
            color: "var(--text-secondary)"
          }}
        >
          <strong style={{ color: "var(--text-main)" }}>Empirical Evidence: </strong>
          {insight.evidence}
        </div>

        {/* AI Summary */}
        <div style={{ marginBottom: "1rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.03em",
              display: "block",
              marginBottom: "3px"
            }}
          >
            Pattern Intelligence Analysis
          </span>
          <p style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.5 }}>
            {insight.aiSummary}
          </p>
        </div>

        {/* Suggested Action Box */}
        <div
          style={{
            backgroundColor: "rgba(2, 132, 199, 0.06)",
            border: "1px dashed rgba(2, 132, 199, 0.35)",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem"
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              display: "block",
              marginBottom: "2px"
            }}
          >
            Recommended Authority Action
          </span>
          <p style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 500 }}>
            {insight.suggestedAction}
          </p>
        </div>

        {/* Mandatory Decision Support Disclaimer */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            lineHeight: 1.35,
            marginBottom: "1.25rem",
            padding: "0.5rem",
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-sm)"
          }}
        >
          <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
          <span>
            {insight.decisionSupportNote ||
              "AI-generated decision support. Does not represent official government decisions. Officer verification required prior to capital dispatch."}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "0.85rem"
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Cluster Analysis: <strong>Empirical Pattern • Demo</strong>
        </span>

        <button
          type="button"
          className={`btn ${acknowledged ? "btn-success" : "btn-primary"} btn-sm`}
          onClick={handleAction}
        >
          {acknowledged ? (
            <>
              <CheckCircle2 size={14} />
              Action Dispatched
            </>
          ) : (
            <>
              <span>Review & Execute Action</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
