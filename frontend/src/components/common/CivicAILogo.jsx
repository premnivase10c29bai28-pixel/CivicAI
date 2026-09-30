import React from "react";

/**
 * CivicAILogo
 * 
 * Professional civic-service brand identity combining:
 * - Location pin geometry
 * - Civic architectural pillars / community structure
 * - Subtle network / AI node
 * 
 * Clean, trustworthy, vector SVG suitable for favicons and headers.
 */
export default function CivicAILogo({
  size = 36,
  showText = true,
  showTagline = true,
  shortTagline = false,
  inverted = false,
  className = ""
}) {
  // Normalize size to an explicit integer pixel value
  const normalizeSize = (s) => {
    if (typeof s === "number" && !isNaN(s) && s > 0) return s;
    if (typeof s === "string") {
      const lower = s.toLowerCase().trim();
      const map = {
        xs: 22,
        sm: 28,
        small: 32,
        md: 38,
        medium: 38,
        lg: 44,
        large: 48,
        xl: 56
      };
      if (map[lower]) return map[lower];
      const parsed = parseInt(s, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 36;
  };

  const pixelSize = normalizeSize(size);
  const primaryColor = inverted ? "#ffffff" : "#123B63";
  const secondaryColor = inverted ? "#93c5fd" : "#1769AA";
  const accentColor = "#E88A1A"; // Indian saffron accent used selectively
  const textColor = inverted ? "#ffffff" : "#17202A";
  const taglineColor = inverted ? "#cbd5e1" : "#5A6A80";

  return (
    <div
      className={`civicai-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.65rem",
        textDecoration: "none",
        userSelect: "none",
        flexShrink: 0
      }}
    >
      {/* Brand Icon SVG */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          minWidth: `${pixelSize}px`,
          minHeight: `${pixelSize}px`,
          maxWidth: `${pixelSize}px`,
          maxHeight: `${pixelSize}px`,
          flexShrink: 0,
          display: "block"
        }}
        aria-label="CivicAI Emblem"
      >
        {/* Shield / Pin Background Container */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="10"
          fill={inverted ? "rgba(255, 255, 255, 0.12)" : "#123B63"}
          stroke={inverted ? "rgba(255, 255, 255, 0.25)" : "#0E2F50"}
          strokeWidth="1.5"
        />

        {/* Top Civic Pediment / Arch */}
        <path
          d="M12 18L24 10L36 18H12Z"
          fill="#ffffff"
        />

        {/* Civic Architectural Pillars */}
        <rect x="15" y="21" width="3.5" height="13" rx="1" fill="#ffffff" fillOpacity="0.95" />
        <rect x="22.25" y="21" width="3.5" height="13" rx="1" fill="#ffffff" fillOpacity="0.95" />
        <rect x="29.5" y="21" width="3.5" height="13" rx="1" fill="#ffffff" fillOpacity="0.95" />

        {/* Base Foundation Bar */}
        <rect x="12" y="35" width="24" height="2.5" rx="1" fill="#ffffff" />

        {/* Central Saffron Civic/AI Telemetry Node */}
        <circle cx="24" cy="14" r="2.5" fill={accentColor} />

        {/* Subtle Network Bridge Arc */}
        <path
          d="M16 16C18.5 14.5 29.5 14.5 32 16"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Typography */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", flexWrap: "nowrap" }}>
            <span
              style={{
                fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                fontSize: pixelSize >= 44 ? "1.35rem" : pixelSize >= 34 ? "1.18rem" : "1.05rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: textColor,
                whiteSpace: "nowrap"
              }}
            >
              Civic<span style={{ color: secondaryColor }}>AI</span>
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "1px 5px",
                borderRadius: "3px",
                backgroundColor: inverted ? "rgba(255, 255, 255, 0.18)" : "rgba(18, 59, 99, 0.08)",
                color: inverted ? "#ffffff" : primaryColor,
                border: inverted ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(18, 59, 99, 0.2)",
                whiteSpace: "nowrap"
              }}
            >
              Public Service
            </span>
          </div>

          {showTagline && (
            <span
              className="civicai-logo-tagline"
              style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                color: taglineColor,
                letterSpacing: "-0.01em",
                marginTop: "1px",
                whiteSpace: "nowrap"
              }}
            >
              {shortTagline
                ? "Smart Civic Services"
                : "AI-Powered Citizen Development Intelligence"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
