import React from "react";
import { MapPin, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";

/**
 * CapturedLocationMap
 * Displays the citizen's captured latitude/longitude on an OpenStreetMap-based preview.
 * GPS coordinates are authoritative; displays accuracy, marker, and reverse geocoded address.
 */
export default function CapturedLocationMap({
  latitude,
  longitude,
  accuracy = null,
  address = "",
  city = "",
  district = "",
  state = "",
  isGeocodingLoading = false,
  geocodingFailed = false
}) {
  if (latitude == null || longitude == null) {
    return null;
  }

  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  const googleMapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;

  // Bounding box for OpenStreetMap preview embed
  const delta = 0.0035;
  const bbox = `${lngNum - delta},${latNum - delta},${lngNum + delta},${latNum + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lngNum}`;

  // Format secondary geographic hierarchy if available
  const areaHierarchy = [city, district, state].filter(Boolean).join(" • ");

  return (
    <div
      style={{
        backgroundColor: "var(--bg-subtle)",
        border: "1px solid var(--border-medium)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        marginTop: "1rem"
      }}
    >
      {/* Map Header with Authoritative GPS Coordinates & Accuracy telemetry */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "60%" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "rgba(5, 150, 105, 0.12)",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <MapPin size={16} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Captured Problem Location</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  backgroundColor: "rgba(5, 150, 105, 0.12)",
                  color: "#059669",
                  padding: "1px 6px",
                  borderRadius: "4px"
                }}
              >
                Marker Placed
              </span>
            </div>

            {/* Address Line with Reverse Geocoding State */}
            <div style={{ fontSize: "0.75rem", marginTop: "2px" }}>
              {isGeocodingLoading ? (
                <span style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                  <Loader2 size={12} className="animate-spin" />
                  Finding address...
                </span>
              ) : geocodingFailed ? (
                <span style={{ color: "#dc2626", fontWeight: 500 }}>
                  Address unavailable
                </span>
              ) : address ? (
                <span style={{ color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.3 }}>
                  {address}
                </span>
              ) : (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Address: Not available (GPS Coordinates captured)
                </span>
              )}
            </div>

            {areaHierarchy && !isGeocodingLoading && !geocodingFailed && (
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>
                {areaHierarchy}
              </div>
            )}
          </div>
        </div>

        {/* Telemetry pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
            {latNum.toFixed(6)}° N, {lngNum.toFixed(6)}° E
          </div>
          {accuracy && (
            <span
              style={{
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                padding: "2px 6px",
                borderRadius: "4px",
                color: "var(--text-secondary)"
              }}
            >
              Accuracy: ±{Math.round(accuracy)}m
            </span>
          )}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
            title="Open exact coordinates on Google Maps"
          >
            <span>External Map</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Interactive OpenStreetMap View Area */}
      <div style={{ height: "260px", position: "relative", width: "100%", backgroundColor: "#e5e7eb" }}>
        <iframe
          title="Captured Location Map Preview"
          src={embedUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            filter: "contrast(1.02) saturate(1.05)"
          }}
          loading="lazy"
        />

        {/* Custom Central Pin Overlay */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              padding: "4px",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "bounce 1.5s infinite"
            }}
          >
            <MapPin size={22} />
          </div>
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "rgba(220, 38, 38, 0.35)",
              borderRadius: "50%",
              marginTop: "-2px"
            }}
          />
        </div>
      </div>

      {/* Footer telemetry bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 1rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={13} color="#059669" />
          <span>
            Authoritative GPS: <strong>{latNum.toFixed(6)}, {lngNum.toFixed(6)}</strong>
          </span>
        </div>
        <div>
          {accuracy ? `Accuracy radius: ±${Math.round(accuracy)} meters` : "High accuracy GPS"}
        </div>
      </div>
    </div>
  );
}
