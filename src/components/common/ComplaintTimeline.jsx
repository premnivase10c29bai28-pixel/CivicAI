import React from "react";
import { Check, Clock, UserCheck, Search, Wrench, CheckCircle2, AlertCircle } from "lucide-react";

export const STAGES = [
  "Reported",
  "Received",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved"
];

export default function ComplaintTimeline({ currentStatus, timeline = [], layout = "horizontal" }) {
  const getStageIndex = (status) => {
    const norm = (status || "").toString().toLowerCase().replace(/_/g, " ").trim();
    if (norm === "reported") return 0;
    if (norm === "received") return 1;
    if (norm === "under review") return 2;
    if (norm === "assigned") return 3;
    if (norm === "in progress") return 4;
    if (norm === "resolved") return 5;
    if (norm === "rejected") return -1;
    return 0;
  };

  const currentIndex = getStageIndex(currentStatus);
  const isRejected = (currentStatus || "").toString().toLowerCase().trim() === "rejected";

  if (layout === "horizontal") {
    // Percentage for line progress
    const progressWidth = isRejected
      ? "100%"
      : `${Math.min(100, Math.max(0, (currentIndex / (STAGES.length - 1)) * 100))}%`;

    return (
      <div style={{ margin: "1.5rem 0" }}>
        {isRejected && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--status-rejected-bg)",
              color: "var(--status-rejected-text)",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.875rem",
              fontWeight: 500
            }}
          >
            <AlertCircle size={16} />
            <span>This complaint was marked as <strong>Rejected</strong> by the reviewing authority.</span>
          </div>
        )}

        <div className="timeline-stepper">
          <div className="timeline-line" />
          <div
            className="timeline-line-progress"
            style={{
              width: progressWidth,
              backgroundColor: isRejected ? "#dc2626" : "var(--primary)"
            }}
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = !isRejected && idx < currentIndex;
            const isActive = !isRejected && idx === currentIndex;

            return (
              <div
                key={stage}
                className={`timeline-step ${
                  isCompleted ? "completed" : isActive ? "active" : ""
                }`}
              >
                <div className="timeline-step-circle">
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.5} />
                  ) : isActive ? (
                    <Clock size={16} strokeWidth={2.2} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="timeline-step-label">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Detailed Vertical Event Timeline
  return (
    <div className="v-timeline">
      {timeline.map((item, idx) => (
        <div key={idx} className="v-timeline-item">
          <div className="v-timeline-dot">
            <Check size={12} strokeWidth={2.5} />
          </div>
          <div className="v-timeline-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.25rem"
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {item.stage}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)"
                }}
              >
                {new Date(item.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
            {item.actor && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--primary)",
                  fontWeight: 500,
                  marginBottom: "4px"
                }}
              >
                Action by: {item.actor}
              </div>
            )}
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: "1.4"
              }}
            >
              {item.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
