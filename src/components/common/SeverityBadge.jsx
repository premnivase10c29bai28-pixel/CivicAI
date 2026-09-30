import React from "react";
import { AlertCircle } from "lucide-react";

export default function SeverityBadge({ severity, showIcon = false }) {
  const getSevConfig = (sev) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return {
          label: "Critical",
          className: "badge-sev-critical",
          dotColor: "#dc2626"
        };
      case "high":
        return {
          label: "High",
          className: "badge-sev-high",
          dotColor: "#ea580c"
        };
      case "medium":
      case "med":
        return {
          label: "Medium",
          className: "badge-sev-medium",
          dotColor: "#f59e0b"
        };
      case "low":
      default:
        return {
          label: "Low",
          className: "badge-sev-low",
          dotColor: "#94a3b8"
        };
    }
  };

  const config = getSevConfig(severity);

  return (
    <span className={`badge ${config.className}`}>
      {showIcon ? (
        <AlertCircle size={12} strokeWidth={2.2} />
      ) : (
        <span
          className="sev-dot"
          style={{ backgroundColor: config.dotColor }}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
