import React from "react";
import { FolderSearch, Plus } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "There are no records matching your current criteria.",
  actionLabel,
  onAction,
  icon: Icon = FolderSearch
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3.5rem 1.5rem",
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border-medium)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--bg-subtle)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem"
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
        {title}
      </h4>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "380px", marginBottom: actionLabel ? "1.25rem" : 0 }}>
        {description}
      </p>

      {actionLabel && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
