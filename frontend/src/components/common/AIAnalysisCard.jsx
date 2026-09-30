import React, { useState, useEffect } from "react";
import { Check, Edit2, AlertCircle, Info, ShieldCheck, CheckCircle2 } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import { CIVIC_CATEGORIES, CIVIC_DEPARTMENTS } from "../../data/mockData";

export default function AIAnalysisCard({
  analysis,
  onConfirm,
  onEditChange,
  isConfirmed = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    category: analysis?.category || "Water Supply",
    subcategory: analysis?.subcategory || "Drinking Water",
    severity: analysis?.severity || "High",
    department: analysis?.department || "Water Supply & Sewerage (CMWSSB)",
    language: analysis?.language || "Tamil",
    summary: analysis?.summary || "Drinking water unavailable for approximately five days.",
    confidence: analysis?.confidence || 0.96
  });

  useEffect(() => {
    if (analysis) {
      setFormData({
        category: analysis.category || "Water Supply",
        subcategory: analysis.subcategory || "Drinking Water",
        severity: analysis.severity || "High",
        department: analysis.department || "Water Supply & Sewerage (CMWSSB)",
        language: analysis.language || "Tamil",
        summary: analysis.summary || "Drinking water unavailable for approximately five days.",
        confidence: analysis.confidence || 0.96
      });
    }
  }, [analysis]);

  const handleInputChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    if (onEditChange) {
      onEditChange(updated);
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onEditChange) {
      onEditChange(formData);
    }
  };

  const confidencePercent = Math.round((formData.confidence || 0.96) * 100);

  return (
    <div
      className="card"
      style={{
        marginTop: "1.25rem",
        border: "1px solid var(--border-medium)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--bg-card)",
        padding: "1.5rem"
      }}
    >
      {/* Official Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: "2px solid var(--primary-navy, #123B63)",
          marginBottom: "1.25rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--primary-navy, #123B63)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff"
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              CivicAI Analysis
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
              Automated classification & municipal routing support
            </p>
          </div>
        </div>

        {/* Confidence & Model Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "rgba(35, 134, 54, 0.1)",
              border: "1px solid rgba(35, 134, 54, 0.3)",
              color: "var(--success-green, #238636)"
            }}
          >
            Confidence: {confidencePercent}%
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-subtle)",
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontWeight: 600
            }}
          >
            Language: {formData.language}
          </span>
        </div>
      </div>

      {/* Mandatory Transparency Disclaimer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.65rem 1rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(23, 105, 170, 0.08)",
          border: "1px solid rgba(23, 105, 170, 0.25)",
          color: "var(--primary-blue, #1769AA)",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.25rem"
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>AI-generated analysis. Please review before submitting.</span>
      </div>

      {/* Structured Fields Presentation */}
      {!isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Metadata Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              backgroundColor: "var(--bg-subtle)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "3px" }}>
                Category
              </span>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                {formData.category}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "3px" }}>
                Subcategory
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                {formData.subcategory}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "3px" }}>
                Severity
              </span>
              <div>
                <SeverityBadge severity={formData.severity} />
              </div>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "3px" }}>
                Responsible Department
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                {formData.department}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card)"
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "block",
                marginBottom: "4px"
              }}
            >
              Summary
            </span>
            <p style={{ fontSize: "0.925rem", color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
              {formData.summary}
            </p>
          </div>
        </div>
      ) : (
        /* Edit Form Mode */
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-medium)",
            marginBottom: "1rem"
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                Category
              </label>
              <select
                className="select-field"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-medium)" }}
              >
                {CIVIC_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                Subcategory
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.subcategory}
                onChange={(e) => handleInputChange("subcategory", e.target.value)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                Severity Level
              </label>
              <select
                className="select-field"
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-medium)" }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                Responsible Department
              </label>
              <select
                className="select-field"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-medium)" }}
              >
                {CIVIC_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                Summary
              </label>
              <textarea
                className="textarea-field"
                rows={2}
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-medium)" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
              Apply Corrections
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Callout & Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          paddingTop: "1rem",
          marginTop: "1.25rem",
          borderTop: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isConfirmed ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--success-green, #238636)", fontWeight: 700, fontSize: "0.9rem" }}>
              <CheckCircle2 size={18} />
              <span>Interpretation Confirmed by Citizen</span>
            </span>
          ) : (
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Verify the AI interpretation above before proceeding.
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {!isEditing && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={14} />
              <span>Edit Details</span>
            </button>
          )}

          <button
            type="button"
            className={`btn ${isConfirmed ? "btn-success" : "btn-primary"} btn-sm`}
            onClick={() => onConfirm(formData)}
            style={{ fontWeight: 600 }}
          >
            <Check size={15} />
            <span>{isConfirmed ? "Confirmed & Ready to Submit" : "Confirm AI Interpretation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
