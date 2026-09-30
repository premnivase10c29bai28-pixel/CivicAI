import React, { useState } from "react";
import { Sparkles, Check, Edit2, AlertCircle } from "lucide-react";
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
    category: analysis.category || "Water Supply",
    subcategory: analysis.subcategory || "Drinking Water",
    severity: analysis.severity || "High",
    department: analysis.department || "Water Supply & Sewerage (CMWSSB)",
    language: analysis.language || "Tamil",
    summary: analysis.summary || "Drinking water has not been available in the reported area for approximately five days."
  });

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

  return (
    <div className="ai-card" style={{ marginTop: "1.5rem" }}>
      <div className="ai-card-glow" />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--ai-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff"
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              CivicAI understood your complaint
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Multi-lingual neural classification & triage
            </p>
          </div>
        </div>

        {/* AI indicator badge */}
        <span className="badge badge-ai">
          <Sparkles size={12} />
          AI-powered analysis • Demo
        </span>
      </div>

      {/* Main Analysis Display / Edit Mode */}
      {!isEditing ? (
        <>
          <div className="ai-meta-grid">
            <div className="ai-meta-item">
              <span className="ai-meta-label">Category</span>
              <span className="ai-meta-val">{formData.category}</span>
            </div>

            <div className="ai-meta-item">
              <span className="ai-meta-label">Subcategory</span>
              <span className="ai-meta-val">{formData.subcategory}</span>
            </div>

            <div className="ai-meta-item">
              <span className="ai-meta-label">Severity</span>
              <div>
                <SeverityBadge severity={formData.severity} />
              </div>
            </div>

            <div className="ai-meta-item">
              <span className="ai-meta-label">Department</span>
              <span className="ai-meta-val" style={{ fontSize: "0.85rem" }}>
                {formData.department}
              </span>
            </div>

            <div className="ai-meta-item">
              <span className="ai-meta-label">Detected Language</span>
              <span className="ai-meta-val">{formData.language}</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              marginBottom: "1.25rem"
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "0.03em",
                display: "block",
                marginBottom: "0.3rem"
              }}
            >
              AI-Generated Summary
            </span>
            <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.5 }}>
              "{formData.summary}"
            </p>
          </div>
        </>
      ) : (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-medium)",
            marginBottom: "1.25rem"
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select-field"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                {CIVIC_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <input
                type="text"
                className="input-field"
                value={formData.subcategory}
                onChange={(e) => handleInputChange("subcategory", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select
                className="select-field"
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="select-field"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              >
                {CIVIC_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "0.5rem" }}>
            <label className="form-label">Summary</label>
            <textarea
              className="textarea-field"
              rows={2}
              style={{ minHeight: "70px" }}
              value={formData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveEdit}
          >
            Apply Corrections
          </button>
        </div>
      )}

      {/* Confirmation Callout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={17} color="var(--primary)" />
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
            Is this interpretation correct?
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={14} />
              Edit Interpretation
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel Edit
            </button>
          )}

          <button
            type="button"
            className={`btn ${isConfirmed ? "btn-success" : "btn-primary"} btn-sm`}
            onClick={() => onConfirm(formData)}
          >
            <Check size={15} />
            {isConfirmed ? "Confirmed & Ready" : "Confirm Interpretation"}
          </button>
        </div>
      </div>
    </div>
  );
}
