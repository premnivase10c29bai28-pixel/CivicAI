import React, { useState } from "react";
import { Sparkles, ShieldAlert, CheckCircle2, Filter, Layers, Brain, ArrowRight } from "lucide-react";
import InsightCard from "../../components/common/InsightCard";
import { useCivicData } from "../../context/CivicDataContext";

export default function AIInsightsPage() {
  const { insights } = useCivicData();
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredInsights = insights.filter((item) => {
    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.4rem" }}>
          <span className="badge badge-ai" style={{ backgroundColor: "rgba(18, 59, 99, 0.08)", color: "#123B63", borderColor: "rgba(18, 59, 99, 0.2)" }}>
            <Sparkles size={12} /> AI Decision Support Engine
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Multilingual Semantic Clustering
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#123B63" }}>Civic Development Insights</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Synthesized machine learning insights detecting systemic failures, seasonal shifts, and infrastructure bottlenecks.
        </p>
      </div>

      {/* Mandatory Decision Support Ethics Disclaimer Banner */}
      <div
        style={{
          backgroundColor: "rgba(18, 59, 99, 0.05)",
          border: "1px solid rgba(18, 59, 99, 0.2)",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.85rem"
        }}
      >
        <ShieldAlert size={22} color="#123B63" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#123B63", marginBottom: "3px" }}>
            Decision-Support Notice &amp; Regulatory Context
          </h4>
          <p style={{ fontSize: "0.84rem", color: "#17202A", lineHeight: 1.5, margin: 0 }}>
            AI-generated decision support based on available CivicAI evidence. Final decisions remain with the responsible authority. 
            All pattern analyses and suggested remedial actions are generated as advisory decision support.
          </p>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginRight: "0.5rem" }}>
          Filter Domain:
        </span>
        {["All", "Water Supply", "Drainage & Sanitation", "Roads & Traffic", "Street Lighting"].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${categoryFilter === cat ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: "var(--radius-full)", fontSize: "0.78rem" }}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.75rem" }} className="insights-cards-grid">
        {filteredInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .insights-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
