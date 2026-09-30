import React from "react";

export default function ChartCard({ title, subtitle, action, children, height = 300 }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div style={{ width: "100%", height, minHeight: height }}>
        {children}
      </div>
    </div>
  );
}
