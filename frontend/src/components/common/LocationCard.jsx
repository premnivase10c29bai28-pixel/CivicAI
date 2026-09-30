import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Edit3,
  Check,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Compass
} from "lucide-react";
import CapturedLocationMap from "./CapturedLocationMap";
import { reverseGeocodeNominatim } from "../../services/geocodingService";

export default function LocationCard({ location, onLocationChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(() => {
    if (location?.captured || (location?.latitude && location?.longitude)) {
      return "success";
    }
    return "idle"; // 'idle' | 'locating' | 'success' | 'error' | 'unsupported'
  });
  const [geocodingStatus, setGeocodingStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState(null);

  const [locData, setLocData] = useState({
    address: location?.address || "",
    city: location?.city || "",
    district: location?.district || "",
    state: location?.state || "",
    ward: location?.ward || "",
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    lat: location?.latitude ?? location?.lat ?? null,
    lng: location?.longitude ?? location?.lng ?? null,
    accuracy: location?.accuracy || null,
    captured: location?.captured || false
  });

  // Sync internal state when external location prop changes (e.g. from preset)
  useEffect(() => {
    if (location) {
      setLocData((prev) => ({
        ...prev,
        ...location,
        address: location.address !== undefined ? location.address : prev.address,
        city: location.city !== undefined ? location.city : prev.city,
        district: location.district !== undefined ? location.district : prev.district,
        state: location.state !== undefined ? location.state : prev.state,
        ward: location.ward !== undefined ? location.ward : prev.ward,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        lat: location.latitude ?? location.lat ?? null,
        lng: location.longitude ?? location.lng ?? null
      }));
      if (location.captured || (location.latitude != null && location.longitude != null)) {
        setStatus("success");
        setErrorMessage("");
      }
    }
  }, [location]);

  // Browser Geolocation API capture + Reverse Geocoding
  const handleUseMyLocation = () => {
    // 1. Check if browser supports Geolocation API
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      setErrorMessage("Geolocation is not supported by your current browser.");
      return;
    }

    setStatus("locating");
    setErrorMessage("");
    setErrorCode(null);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = parseFloat(pos.coords.latitude.toFixed(6));
        const longitude = parseFloat(pos.coords.longitude.toFixed(6));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;

        // Step 1: Capture and display authoritative GPS coordinates immediately
        const gpsCaptured = {
          ...locData,
          latitude,
          longitude,
          lat: latitude,
          lng: longitude,
          accuracy,
          captured: true,
          capturedAt: new Date().toISOString()
        };

        setLocData(gpsCaptured);
        setStatus("success");
        setErrorMessage("");
        setGeocodingStatus("loading");

        if (onLocationChange) {
          onLocationChange(gpsCaptured);
        }

        // Step 2: Request reverse geocoding via Nominatim
        try {
          const geoResult = await reverseGeocodeNominatim(latitude, longitude);
          const resolved = {
            ...gpsCaptured,
            address: geoResult.displayName || "",
            city: geoResult.city || "",
            district: geoResult.district || "",
            state: geoResult.state || ""
          };

          setLocData(resolved);
          setGeocodingStatus("success");

          if (onLocationChange) {
            onLocationChange(resolved);
          }
        } catch (geoErr) {
          if (geoErr.name !== "AbortError") {
            console.warn("[LocationCard] Reverse geocoding failed:", geoErr.message);
            setGeocodingStatus("error");
            // Coordinates, accuracy, and map remain active; complaint submission is not blocked
          }
        }
      },
      (err) => {
        console.warn("[LocationCard] Geolocation error:", err.code, err.message);
        setStatus("error");
        setErrorCode(err.code);

        switch (err.code) {
          case 1: // error.PERMISSION_DENIED
            setErrorMessage(
              "Permission denied: Location access was blocked. Please allow location access in your browser site permissions to capture coordinates."
            );
            break;
          case 2: // error.POSITION_UNAVAILABLE
            setErrorMessage(
              "Location unavailable: Your device or network could not determine GPS coordinates. Please try again."
            );
            break;
          case 3: // error.TIMEOUT
            setErrorMessage(
              "Timeout: The location request timed out. Please check your signal and click Retry."
            );
            break;
          default:
            setErrorMessage(
              err.message || "An unexpected error occurred while capturing location."
            );
            break;
        }
      },
      geoOptions
    );
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onLocationChange) {
      onLocationChange(locData);
    }
  };

  const hasCoordinates =
    locData.latitude !== null &&
    locData.latitude !== undefined &&
    locData.longitude !== null &&
    locData.longitude !== undefined;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.5rem",
        boxShadow: "var(--shadow-card)"
      }}
    >
      {/* Header with Title, State Badge & Main "Use My Location" Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <MapPin size={20} color="var(--primary)" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                Incident Location
              </h3>
              {/* Status Badge */}
              {status === "success" && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: "rgba(35, 134, 54, 0.12)",
                    color: "var(--success-green, #238636)",
                    border: "1px solid var(--success-green, #238636)",
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.55rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 700
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>✓ Location captured</span>
                </span>
              )}
              {status === "locating" && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: "rgba(23, 105, 170, 0.12)",
                    color: "var(--primary-blue, #1769AA)",
                    border: "1px solid var(--primary-blue, #1769AA)",
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.55rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Loader2 size={12} className="animate-spin" />
                  <span>Capturing GPS...</span>
                </span>
              )}
              {status === "error" && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    color: "#dc2626",
                    border: "1px solid #ef4444",
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.55rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <AlertCircle size={12} />
                  <span>Location capture failed (Optional)</span>
                </span>
              )}
              {status === "unsupported" && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    color: "#b45309",
                    border: "1px solid #f59e0b",
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.55rem"
                  }}
                >
                  Geolocation Unsupported
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
              Help authorities identify where the issue occurred.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            id="use-my-location-btn"
            className={`btn ${status === "success" ? "btn-secondary" : "btn-primary"} btn-sm`}
            onClick={handleUseMyLocation}
            disabled={status === "locating"}
            style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {status === "locating" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Capturing GPS...</span>
              </>
            ) : status === "success" ? (
              <>
                <Navigation size={14} color="var(--primary)" />
                <span>Re-capture Location</span>
              </>
            ) : (
              <>
                <Navigation size={14} />
                <span>Use My Current Location</span>
              </>
            )}
          </button>

          {!isEditing ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.78rem" }}
              onClick={() => setIsEditing(true)}
              title="Edit locality or street name"
            >
              <Edit3 size={13} />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontSize: "0.78rem" }}
              onClick={handleSaveEdit}
            >
              <Check size={13} />
              <span>Done</span>
            </button>
          )}
        </div>
      </div>

      {/* Error State Banner with Specific Guidance & Retry Action */}
      {status === "error" && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid #ef4444",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "0.85rem",
            color: "#dc2626"
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: "2px" }}>
              Unable to capture location
            </div>
            <div>{errorMessage}</div>
            <div
              style={{
                marginTop: "0.6rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "wrap"
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.6rem",
                  fontWeight: 600
                }}
                onClick={handleUseMyLocation}
              >
                <RotateCcw size={12} />
                <span>Retry "Use My Location"</span>
              </button>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Note: Location is optional. You can still submit your complaint without it.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unsupported Browser Banner */}
      {status === "unsupported" && (
        <div
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid #f59e0b",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "0.85rem",
            color: "#b45309"
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: "2px" }}>
              Geolocation Unsupported
            </div>
            <div>
              Your browser does not support the Geolocation API. You can still type your street address or submit without GPS coordinates.
            </div>
          </div>
        </div>
      )}

      {/* Coordinate & Location Details Display */}
      {!isEditing ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
            backgroundColor: "var(--bg-subtle)",
            padding: "0.9rem 1.1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          {/* Coordinates block */}
          <div>
            <span
              style={{
                fontSize: "0.725rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)",
                fontWeight: 600,
                display: "block",
                marginBottom: "3px"
              }}
            >
              GPS Coordinates
            </span>
            {hasCoordinates ? (
              <div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: status === "success" ? "#059669" : "var(--primary)"
                  }}
                >
                  {Number(locData.latitude).toFixed(6)}° N,{" "}
                  {Number(locData.longitude).toFixed(6)}° E
                </span>
                {locData.accuracy && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      display: "block",
                      marginTop: "2px"
                    }}
                  >
                    Accuracy: ±{locData.accuracy}m
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                Not captured yet (Optional)
              </span>
            )}
          </div>

          {/* Address / display_name block */}
          <div style={{ minWidth: "220px" }}>
            <span
              style={{
                fontSize: "0.725rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)",
                fontWeight: 600,
                display: "block",
                marginBottom: "3px"
              }}
            >
              Address
            </span>
            <div>
              {geocodingStatus === "loading" ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Finding address...</span>
                </div>
              ) : geocodingStatus === "error" ? (
                <span style={{ fontSize: "0.85rem", color: "#dc2626", fontWeight: 600 }}>
                  Address unavailable
                </span>
              ) : locData.address ? (
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", lineHeight: 1.4, display: "block" }}>
                  {locData.address}
                </span>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  Address: Not available
                </span>
              )}
            </div>
          </div>

          {/* City / Locality block */}
          <div>
            <span
              style={{
                fontSize: "0.725rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)",
                fontWeight: 600,
                display: "block",
                marginBottom: "3px"
              }}
            >
              City / Locality
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: locData.city ? "var(--text-main)" : "var(--text-muted)" }}>
              {geocodingStatus === "loading" ? "Finding..." : (locData.city || "Not available")}
            </span>
          </div>

          {/* District block */}
          <div>
            <span
              style={{
                fontSize: "0.725rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)",
                fontWeight: 600,
                display: "block",
                marginBottom: "3px"
              }}
            >
              District
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: locData.district ? "var(--text-main)" : "var(--text-muted)" }}>
              {geocodingStatus === "loading" ? "Finding..." : (locData.district || "Not available")}
            </span>
          </div>

          {/* State block */}
          <div>
            <span
              style={{
                fontSize: "0.725rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "var(--text-muted)",
                fontWeight: 600,
                display: "block",
                marginBottom: "3px"
              }}
            >
              State
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: locData.state ? "var(--text-main)" : "var(--text-muted)" }}>
              {geocodingStatus === "loading" ? "Finding..." : (locData.state || "Not available")}
            </span>
          </div>
        </div>
      ) : (
        /* Edit Landmark & Locality Inputs */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
            <label className="text-xs text-muted">Street Address / Landmark (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Cross Street 4, Kasturba Nagar"
              value={locData.address}
              onChange={(e) => setLocData({ ...locData, address: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted">City / Locality (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Chennai"
              value={locData.city}
              onChange={(e) => setLocData({ ...locData, city: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted">District (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Chennai District"
              value={locData.district}
              onChange={(e) => setLocData({ ...locData, district: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted">State (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Tamil Nadu"
              value={locData.state}
              onChange={(e) => setLocData({ ...locData, state: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Captured Location Map (Shown after successful location capture) */}
      {hasCoordinates && (
        <CapturedLocationMap
          latitude={locData.latitude}
          longitude={locData.longitude}
          accuracy={locData.accuracy}
          address={locData.address}
          city={locData.city}
          district={locData.district}
          state={locData.state}
          isGeocodingLoading={geocodingStatus === "loading"}
          geocodingFailed={geocodingStatus === "error"}
        />
      )}
    </div>
  );
}
