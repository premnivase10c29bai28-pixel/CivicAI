import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import { useCivicData } from "../../context/CivicDataContext";

export default function InsightCard({ insight }) {
  const { showToast } = useCivicData();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAction = () => {
    setAcknowledged(true);
    showToast(`Decision Support Action logged for ${insight.area}: Official inspection record queued.`, "success");
  };

  const priorityColor =
    insight.severity === "Critical" || insight.severity === "High"
      ? "#C53030"
      : insight.severity === "Medium"
      ? "#B7791F"
      : "#1769AA";

  return (
    <div
      className="card"
      style={{
        position: "relative",
        borderTop: `4px solid ${priorityColor}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "0.85rem",
        padding: "1.25rem"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {/* Header with AI indicator and Area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#123B63",
                backgroundColor: "rgba(18, 59, 99, 0.08)",
                padding: "3px 8px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Sparkles size={11} /> AI Decision Support • Gemini 3.6 Flash
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-subtle)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              {insight.area}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: insight.trendDirection === "up" ? "#C53030" : "var(--text-secondary)",
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

        {/* 1. ISSUE IDENTIFIED */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "0.75rem 0.85rem",
            borderRadius: "6px",
            border: "1px solid var(--border-color)"
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: "0.2rem"
            }}
          >
            Issue Identified
          </span>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--text-main)",
              margin: "0 0 0.25rem 0"
            }}
          >
            {insight.title}
          </h3>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
            Domain: {insight.category || "Municipal Infrastructure"}
          </span>
        </div>

        {/* 2. EVIDENCE */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "0.65rem 0.85rem",
            borderRadius: "6px",
            border: "1px solid var(--border-color)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)"
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: "0.2rem"
            }}
          >
            Evidence
          </span>
          <p style={{ margin: 0, color: "var(--text-main)", lineHeight: 1.45, fontWeight: 500 }}>
            {insight.evidence}
          </p>
        </div>

        {/* 3. OBSERVATIONS */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "0.65rem 0.85rem",
            borderRadius: "6px",
            border: "1px solid var(--border-color)"
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#123B63",
              display: "block",
              marginBottom: "0.2rem"
            }}
          >
            Observations
          </span>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-main)", lineHeight: 1.45, fontWeight: 500 }}>
            {insight.aiSummary}
          </p>
        </div>

        {/* 4. POSSIBLE CONTRIBUTING FACTORS */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "0.65rem 0.85rem",
            borderRadius: "6px",
            border: "1px solid var(--border-color)"
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: "0.2rem"
            }}
          >
            Possible Contributing Factors
          </span>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            {insight.possibleFactors ||
              "Clustered complaint spikes may indicate localized service disruption, pending on-site verification."}
          </p>
        </div>

        {/* 5. AUTHORITY REVIEW */}
        <div
          style={{
            backgroundColor: "#fff7ed",
            border: "1px dashed rgba(232, 138, 26, 0.45)",
            padding: "0.75rem 0.85rem",
            borderRadius: "6px"
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#B7791F",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              display: "block",
              marginBottom: "0.2rem"
            }}
          >
            Authority Review
          </span>
          <p style={{ fontSize: "0.84rem", color: "#17202A", fontWeight: 500, margin: 0, lineHeight: 1.45 }}>
            {insight.suggestedAction}
          </p>
        </div>

        {/* 6. PRIORITY & CONFIDENCE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.6rem",
            backgroundColor: "var(--bg-subtle)",
            padding: "0.6rem 0.85rem",
            borderRadius: "6px",
            border: "1px solid var(--border-color)"
          }}
        >
          <div>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
              Priority
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: priorityColor,
                marginTop: "2px",
                display: "inline-block"
              }}
            >
              {(insight.severity || "Medium").toUpperCase()}
            </span>
          </div>
          <div>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
              Confidence
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-main)", fontWeight: 600, marginTop: "2px", display: "inline-block" }}>
              94% Evidence Alignment
            </span>
          </div>
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
            padding: "0.5rem 0.65rem",
            background: "rgba(18, 59, 99, 0.04)",
            border: "1px solid rgba(18, 59, 99, 0.12)",
            borderRadius: "4px"
          }}
        >
          <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: "1px", color: "#123B63" }} />
          <span>
            AI-generated decision support based on available CivicAI evidence. Final decisions remain with the responsible authority.
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "0.75rem"
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Cluster: <strong>{insight.area} Telemetry</strong>
        </span>

        <button
          type="button"
          className={`btn ${acknowledged ? "btn-success" : "btn-primary"} btn-sm`}
          style={{
            backgroundColor: acknowledged ? "#238636" : "#123B63",
            color: "#ffffff",
            borderColor: acknowledged ? "#238636" : "#123B63"
          }}
          onClick={handleAction}
        >
          {acknowledged ? (
            <>
              <CheckCircle2 size={13} />
              Review Noted
            </>
          ) : (
            <>
              <span>Review Action</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
