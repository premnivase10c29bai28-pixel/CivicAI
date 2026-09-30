import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Loader2,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { getDevelopmentInsight } from "../../services/aiService";

// In-memory module cache to avoid redundant network calls
const insightCache = new Map();

/**
 * CivicDevelopmentInsightCard
 * 
 * Upgraded Gemini-powered authority decision-support component.
 * Displays verified deterministic civic evidence alongside Gemini AI interpretation,
 * observations, contributing factors, suggested authority review, priority, and disclaimers.
 * 
 * @param {Object} props
 * @param {Object} props.hotspot - The hotspot cluster object
 * @param {boolean} [props.compact=false] - Whether to render in compact card mode
 * @param {string} [props.className=""] - Additional CSS class names
 */
export default function CivicDevelopmentInsightCard({
  hotspot,
  compact = false,
  className = ""
}) {
  // 1. Extract verified deterministic numbers (Authoritative Ground Truth)
  const count = hotspot ? (hotspot.complaintCount || (hotspot.memberComplaints?.length || 0)) : 0;
  const radius = hotspot?.clusteringRadiusKm || 2.0;
  const recent = hotspot ? (hotspot.recentCount ?? count) : 0;
  const severity = hotspot?.highestSeverity || "Medium";
  const category = hotspot?.dominantCategory || "General Civic";
  const facilityCount = hotspot
    ? (hotspot.nearbyFacilityCount ?? hotspot.publicHealthEvidence?.nearbyFacilityCount ?? 0)
    : 0;
  const nearestDist = hotspot
    ? (hotspot.nearestFacilityDistanceKm ?? hotspot.publicHealthEvidence?.nearestFacilityDistanceKm)
    : null;
  const nearestName = hotspot
    ? (hotspot.nearestFacilityName || hotspot.publicHealthEvidence?.nearestFacilityName)
    : null;

  const reviewCategory =
    category.toLowerCase() === "water supply" ? "water-supply" : category.toLowerCase();

  // Deterministic Verified Evidence Bullets (Ground Truth)
  const verifiedEvidenceBullets = [
    `${count} ${count === 1 ? "complaint" : "complaints"}`,
    `${recent} recent ${recent === 1 ? "complaint" : "complaints"}`,
    `${severity} severity`,
    facilityCount > 0
      ? `${facilityCount} GCC ${facilityCount === 1 ? "facility" : "facilities"} within 1 km`
      : `No GCC health facility found within 1 km`,
    nearestDist != null
      ? `Nearest facility: ${Number(nearestDist).toFixed(3)} km${nearestName ? ` (${nearestName})` : ""}`
      : null
  ].filter(Boolean);

  // Cache key based on cluster identity & deterministic evidence values
  const cacheKey = hotspot
    ? `${hotspot.id}_${count}_${recent}_${radius}_${severity}_${facilityCount}`
    : "empty_hotspot";

  // State management (Hooks called unconditionally)
  const [geminiData, setGeminiData] = useState(() => (hotspot ? insightCache.get(cacheKey) || null : null));
  const [loading, setLoading] = useState(!insightCache.has(cacheKey) && !compact && Boolean(hotspot));

  // Fetch or retrieve from cache
  useEffect(() => {
    if (!hotspot || compact || !cacheKey || cacheKey === "empty_hotspot") return;

    if (insightCache.has(cacheKey)) {
      const cached = insightCache.get(cacheKey);
      if (cached && !cached.isFallback) {
        setGeminiData(cached);
        setLoading(false);
        return;
      }
    }

    let isMounted = true;
    setLoading(true);

    getDevelopmentInsight(hotspot)
      .then((data) => {
        if (!isMounted) return;
        insightCache.set(cacheKey, data);
        setGeminiData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("[CivicDevelopmentInsightCard] Gemini API call error, using deterministic fallback:", err.message);
        if (!isMounted) return;
        // Deterministic fallback matching expected schema
        const fallback = {
          title: `Recurring ${category} Issue Detected`,
          summary: `Recent ${reviewCategory} complaints are concentrated within a ${radius} km area. The pattern warrants authority review to determine whether the reports represent a recurring local service issue.`,
          issueType: category,
          observations: [
            `${count} ${count === 1 ? "complaint is" : "complaints are"} concentrated within the detected hotspot.`,
            `All recent complaints are associated with ${category}.`,
            `The highest reported severity is ${severity}.`,
            facilityCount > 0
              ? `${facilityCount} GCC health ${facilityCount === 1 ? "facility is" : "facilities are"} located within 1 km of the hotspot.`
              : `No GCC health facilities are located within 1 km of the hotspot.`
          ],
          possibleContributingFactors: [
            "The concentration of recent complaints may indicate a localized service disruption.",
            "The available evidence is insufficient to determine the underlying cause."
          ],
          authorityReview: `Review the clustered complaints and determine whether a recurring ${reviewCategory} issue is present in this area.`,
          priority: severity === "Critical" || severity === "High" ? "High" : severity === "Medium" ? "Medium" : "Low",
          confidenceNote: "Deterministic decision-support synthesis grounded in verified CivicAI telemetry and GCC registry data.",
          disclaimer: "AI-generated decision support based on available CivicAI evidence. Final decisions remain with the responsible authority.",
          isFallback: true
        };
        insightCache.set(cacheKey, fallback);
        setGeminiData(fallback);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cacheKey, compact, hotspot, category, count, facilityCount, radius, recent, reviewCategory, severity]);

  // Derived active values
  const activeTitle =
    geminiData?.title ||
    hotspot?.developmentInsight?.title ||
    `Recurring ${category} Issue Detected`;

  const activeSummary =
    geminiData?.summary ||
    `Recent ${reviewCategory} complaints are concentrated within a ${radius} km area. The pattern warrants authority review to determine whether the reports represent a recurring local service issue.`;

  const activeObservations =
    geminiData?.observations || [
      `${count} ${count === 1 ? "complaint is" : "complaints are"} concentrated within the detected hotspot.`,
      `All recent complaints are associated with ${category}.`,
      `The highest reported severity is ${severity}.`,
      facilityCount > 0
        ? `${facilityCount} GCC health ${facilityCount === 1 ? "facility is" : "facilities are"} located within 1 km of the hotspot.`
        : `No GCC health facility located within 1 km of the hotspot.`
    ];

  const activeFactors =
    geminiData?.possibleContributingFactors || [
      "The concentration of recent complaints may indicate a localized service disruption.",
      "The available evidence is insufficient to determine the underlying cause."
    ];

  const activeReview =
    geminiData?.authorityReview ||
    hotspot?.developmentInsight?.suggestedReview ||
    `Review the clustered complaints and determine whether a recurring ${reviewCategory} issue is present in this area.`;

  const activePriority = (geminiData?.priority || (severity === "Critical" || severity === "High" ? "High" : "Medium")).toUpperCase();

  const priorityColor =
    activePriority === "HIGH" || activePriority === "CRITICAL"
      ? "#C53030"
      : activePriority === "MEDIUM"
      ? "#B7791F"
      : "#1769AA";

  const activeModelBadge =
    geminiData?.modelLabel ||
    (geminiData?.modelUsed === "gemini-3.6-flash"
      ? "Gemini 3.6 Flash"
      : geminiData?.modelUsed === "gemini-3.8-flash"
      ? "Gemini 3.8 Flash"
      : geminiData?.modelUsed
      ? String(geminiData.modelUsed)
      : "Gemini 3.6 Flash");

  const activeConfidence =
    geminiData?.confidenceNote ||
    "High confidence based on verified CivicAI telemetry and GCC open registry data.";

  // Safe early return AFTER all hooks
  if (!hotspot) return null;

  // ==========================================
  // COMPACT VIEW (For Hotspot Cards)
  // ==========================================
  if (compact) {
    return (
      <div
        className={`civic-development-insight-compact ${className}`}
        style={{
          padding: "0.65rem 0.8rem",
          borderRadius: "8px",
          backgroundColor: "rgba(37, 99, 235, 0.05)",
          border: "1px solid rgba(37, 99, 235, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Sparkles size={13} style={{ color: "var(--brand-primary, #2563eb)" }} />
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                color: "var(--brand-primary, #2563eb)",
                textTransform: "uppercase"
              }}
            >
              CIVIC DEVELOPMENT INSIGHT
            </span>
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            {count} in {radius} km
          </span>
        </div>

        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
          {activeTitle}
        </div>

        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
          {activeReview}
        </p>
      </div>
    );
  }

  // ==========================================
  // FULL INSPECTION VIEW
  // ==========================================
  return (
    <div
      className={`civic-development-insight-card ${className}`}
      style={{
        borderRadius: "10px",
        backgroundColor: "var(--bg-surface, #ffffff)",
        border: "1px solid rgba(37, 99, 235, 0.28)",
        boxShadow: "0 4px 16px rgba(37, 99, 235, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Top Banner Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.55rem 0.85rem",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          borderBottom: "1px solid rgba(37, 99, 235, 0.15)",
          flexWrap: "wrap",
          gap: "0.4rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Sparkles size={14} style={{ color: "var(--brand-primary, #2563eb)" }} />
          <div>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "var(--brand-primary, #2563eb)",
                textTransform: "uppercase"
              }}
            >
              CIVIC DEVELOPMENT INSIGHT
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--text-muted)",
                marginLeft: "0.4rem",
                fontWeight: 600,
                textTransform: "uppercase"
              }}
            >
              • AI Decision Support
            </span>
          </div>
        </div>

        <div>
          {loading ? (
            <span
              style={{
                fontSize: "0.65rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "999px",
                backgroundColor: "rgba(234, 88, 12, 0.12)",
                color: "#ea580c",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <Loader2 size={10} className="animate-spin" />
              Generating AI Development Insight...
            </span>
          ) : geminiData?.isFallback ? (
            <span
              style={{
                fontSize: "0.65rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "999px",
                backgroundColor: "rgba(100, 116, 139, 0.12)",
                color: "var(--text-muted)",
                fontWeight: 600
              }}
            >
              Deterministic Synthesis
            </span>
          ) : (
            <span
              style={{
                fontSize: "0.65rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "999px",
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                color: "var(--brand-primary, #2563eb)",
                fontWeight: 700
              }}
            >
              {activeModelBadge}
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div style={{ padding: "0.9rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        
        {/* Prominent Mandatory Disclaimer Banner */}
        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: "6px",
            backgroundColor: "rgba(18, 59, 99, 0.06)",
            border: "1px solid rgba(18, 59, 99, 0.18)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem"
          }}
        >
          <ShieldAlert size={15} style={{ color: "#123B63", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ margin: 0, fontSize: "0.74rem", color: "#17202A", lineHeight: 1.45, fontWeight: 500 }}>
            <strong>Decision-Support Notice:</strong> AI-generated decision support based on available CivicAI evidence. Final decisions remain with the responsible authority.
          </p>
        </div>

        {/* 1. ISSUE IDENTIFIED CARD */}
        <div
          style={{
            padding: "0.75rem 0.85rem",
            borderRadius: "8px",
            backgroundColor: "var(--bg-subtle, #f8fafc)",
            border: "1px solid var(--border-color, #e2e8f0)"
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
              marginBottom: "0.25rem"
            }}
          >
            Issue Identified
          </span>
          <h4
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              margin: "0 0 0.25rem 0",
              color: severity === "High" || severity === "Critical" ? "#C53030" : "var(--text-main)",
              lineHeight: 1.3
            }}
          >
            {activeTitle}
          </h4>
          <p
            style={{
              margin: "0 0 0.35rem 0",
              fontSize: "0.8rem",
              color: "var(--text-main)",
              lineHeight: 1.45,
              fontWeight: 500
            }}
          >
            {activeSummary}
          </p>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Cluster ID: <code>{hotspot.id}</code> • Geographic Radius: {radius} km • Domain: {category}
          </span>
        </div>

        {/* 2. EVIDENCE (Deterministic Verified Telemetry) */}
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "8px",
            backgroundColor: "var(--bg-subtle, #f8fafc)",
            border: "1px solid var(--border-color, #e2e8f0)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.4rem"
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)"
              }}
            >
              Evidence
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              CivicAI Telemetry &amp; GCC Registry
            </span>
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: "1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              listStyleType: "disc"
            }}
          >
            {verifiedEvidenceBullets.map((bullet, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-main)",
                  lineHeight: 1.4,
                  fontWeight: 500
                }}
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. OBSERVATIONS (AI Observations) */}
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "8px",
            backgroundColor: "var(--bg-subtle, #f8fafc)",
            border: "1px solid var(--border-color, #e2e8f0)"
          }}
        >
          <div style={{ marginBottom: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "#123B63"
              }}
            >
              Observations
            </span>
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: "1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              listStyleType: "disc"
            }}
          >
            {activeObservations.map((obs, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-main)",
                  lineHeight: 1.4,
                  fontWeight: 500
                }}
              >
                {obs}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. POSSIBLE CONTRIBUTING FACTORS */}
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "8px",
            backgroundColor: "var(--bg-subtle, #f8fafc)",
            border: "1px solid var(--border-color, #e2e8f0)"
          }}
        >
          <div style={{ marginBottom: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)"
              }}
            >
              Possible Contributing Factors
            </span>
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: "1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              listStyleType: "disc"
            }}
          >
            {activeFactors.map((fac, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                  fontWeight: 500
                }}
              >
                {fac}
              </li>
            ))}
          </ul>
        </div>

        {/* 5. AUTHORITY REVIEW */}
        <div className="civic-authority-review-container">
          <div className="civic-authority-review-heading">
            Authority Review:
          </div>
          <p className="civic-authority-review-text">
            {activeReview}
          </p>
        </div>

        {/* 6. PRIORITY & CONFIDENCE */}
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "8px",
            backgroundColor: "var(--bg-subtle, #f8fafc)",
            border: "1px solid var(--border-color, #e2e8f0)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem"
          }}
        >
          <div>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
              Priority
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: priorityColor,
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                backgroundColor: `${priorityColor}1a`,
                display: "inline-block"
              }}
            >
              {activePriority}
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
              Confidence
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-main)", fontWeight: 500, lineHeight: 1.35, display: "block" }}>
              {activeConfidence}
            </span>
          </div>
        </div>

        {/* Dynamic Model Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.3rem",
            borderTop: "1px solid var(--border-color, #e2e8f0)",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>
              AI Decision Support:
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#123B63"
              }}
            >
              {activeModelBadge}
            </span>
          </div>

          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            CivicAI Telemetry Engine
          </span>
        </div>
      </div>

      {/* Contrast & Theme-Safe Styles */}
      <style>{`
        .civic-authority-review-container {
          background-color: #fff7ed;
          border: 1px dashed rgba(234, 88, 12, 0.45);
          padding: 0.85rem 1rem;
          border-radius: 8px;
        }

        .civic-authority-review-heading {
          color: #c2410c;
          font-weight: 800;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.35rem;
        }

        .civic-authority-review-text {
          color: #0f172a !important;
          font-size: 0.84rem;
          font-weight: 500;
          line-height: 1.45;
          margin: 0;
        }

        [data-theme="dark"] .civic-authority-review-container,
        .dark .civic-authority-review-container {
          background-color: rgba(234, 88, 12, 0.14) !important;
          border-color: rgba(251, 146, 60, 0.5) !important;
        }

        [data-theme="dark"] .civic-authority-review-heading,
        .dark .civic-authority-review-heading {
          color: #fb923c !important;
        }

        [data-theme="dark"] .civic-authority-review-text,
        .dark .civic-authority-review-text {
          color: #f8fafc !important;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
