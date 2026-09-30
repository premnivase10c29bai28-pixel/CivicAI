import React from "react";
import { Check, Clock, AlertCircle, ArrowDown } from "lucide-react";

export const STAGES = [
  "Reported",
  "Received",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved"
];

export default function ComplaintTimeline({
  currentStatus,
  timeline = [],
  layout = "horizontal",
  submittedDate = null,
  lastUpdatedDate = null,
  authorityNote = null
}) {
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
    const progressWidth = isRejected
      ? "100%"
      : `${Math.min(100, Math.max(0, (currentIndex / (STAGES.length - 1)) * 100))}%`;

    return (
      <div style={{ margin: "1rem 0" }}>
        {isRejected && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              backgroundColor: "rgba(197, 48, 48, 0.1)",
              border: "1px solid rgba(197, 48, 48, 0.25)",
              color: "#C53030",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem",
              fontWeight: 600
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
              backgroundColor: isRejected ? "#C53030" : "#123B63"
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
                <div
                  className="timeline-step-circle"
                  style={{
                    backgroundColor: isCompleted ? "#238636" : isActive ? "#123B63" : "#ffffff",
                    borderColor: isCompleted ? "#238636" : isActive ? "#123B63" : "#cbd5e1",
                    color: isCompleted || isActive ? "#ffffff" : "#64748b"
                  }}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isActive ? (
                    <Clock size={14} strokeWidth={2.5} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className="timeline-step-label"
                  style={{
                    fontWeight: isActive || isCompleted ? 700 : 500,
                    color: isActive ? "#123B63" : isCompleted ? "#238636" : "var(--text-muted)"
                  }}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Official Service-Status Vertical Timeline (Section 13)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Official Status Metadata Box */}
      {(submittedDate || lastUpdatedDate || authorityNote) && (
        <div
          style={{
            padding: "0.75rem 0.85rem",
            borderRadius: "6px",
            backgroundColor: "rgba(18, 59, 99, 0.04)",
            border: "1px solid rgba(18, 59, 99, 0.15)",
            marginBottom: "0.75rem",
            fontSize: "0.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem"
          }}
        >
          {submittedDate && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Submitted Date:</span>
              <strong style={{ color: "var(--text-main)" }}>{submittedDate}</strong>
            </div>
          )}
          {lastUpdatedDate && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Last Updated:</span>
              <strong style={{ color: "var(--text-main)" }}>{lastUpdatedDate}</strong>
            </div>
          )}
          {authorityNote && (
            <div style={{ marginTop: "0.25rem", paddingTop: "0.35rem", borderTop: "1px dashed var(--border-color)" }}>
              <span style={{ color: "#B7791F", fontWeight: 700, display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                Authority Note:
              </span>
              <p style={{ margin: "2px 0 0 0", color: "#17202A", fontSize: "0.8rem", lineHeight: 1.4 }}>
                {authorityNote}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Official Stage Sequence */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {STAGES.map((stage, idx) => {
          const isCompleted = !isRejected && idx < currentIndex;
          const isActive = !isRejected && idx === currentIndex;
          const isPending = !isRejected && idx > currentIndex;

          // Find specific timestamp from timeline array if available
          const timelineEntry = Array.isArray(timeline)
            ? timeline.find(
                (t) => (t.stage || "").toLowerCase() === stage.toLowerCase()
              )
            : null;

          return (
            <React.Fragment key={stage}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                  padding: "0.5rem 0.65rem",
                  borderRadius: "6px",
                  backgroundColor: isActive
                    ? "rgba(18, 59, 99, 0.08)"
                    : isCompleted
                    ? "rgba(35, 134, 54, 0.04)"
                    : "transparent",
                  border: isActive ? "1px solid rgba(18, 59, 99, 0.2)" : "1px solid transparent"
                }}
              >
                {/* Indicator Symbol */}
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                    backgroundColor: isCompleted
                      ? "#238636"
                      : isActive
                      ? "#123B63"
                      : "transparent",
                    border: isPending ? "2px solid #94a3b8" : "none",
                    color: isCompleted || isActive ? "#ffffff" : "#94a3b8",
                    fontSize: "0.75rem",
                    fontWeight: 800
                  }}
                >
                  {isCompleted ? (
                    <Check size={13} strokeWidth={3} />
                  ) : isActive ? (
                    <span style={{ fontSize: "14px", lineHeight: 1 }}>●</span>
                  ) : (
                    <span style={{ fontSize: "10px" }}>○</span>
                  )}
                </div>

                {/* Stage Label & Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 800 : isCompleted ? 700 : 500,
                        color: isActive ? "#123B63" : isCompleted ? "#238636" : "var(--text-muted)"
                      }}
                    >
                      {isCompleted ? `✓ ${stage}` : isActive ? `● ${stage}` : `○ ${stage}`}
                    </span>

                    {timelineEntry?.timestamp && (
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {new Date(timelineEntry.timestamp).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    )}
                  </div>

                  {timelineEntry?.note && (
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                      {timelineEntry.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Down Arrow between stages */}
              {idx < STAGES.length - 1 && (
                <div style={{ display: "flex", paddingLeft: "15px", color: isCompleted ? "#238636" : "#cbd5e1" }}>
                  <ArrowDown size={14} style={{ opacity: isCompleted ? 0.8 : 0.4 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
