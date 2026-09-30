import React, { useState } from "react";
import { MapPin, Navigation, Edit3, Check, Loader2 } from "lucide-react";

export default function LocationCard({ location, onLocationChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locData, setLocData] = useState({
    address: location?.address || "Cross Street 4, Kasturba Nagar, Adyar",
    ward: location?.ward || "Ward 12",
    district: location?.district || "Chennai South",
    lat: location?.lat || 13.0067,
    lng: location?.lng || 80.2571
  });

  const handleUseCurrent = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          const gpsLocation = {
            ...locData,
            lat,
            lng,
            address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            ward: locData.ward || "Ward 12",
            district: locData.district || "Chennai South"
          };
          setLocData(gpsLocation);
          if (onLocationChange) onLocationChange(gpsLocation);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation fallback applied:", err.message);
          const fallbackLocation = {
            address: "Cross Street 4, Kasturba Nagar, Adyar",
            ward: "Ward 12",
            district: "Chennai South",
            lat: 13.0067,
            lng: 80.2571
          };
          setLocData(fallbackLocation);
          if (onLocationChange) onLocationChange(fallbackLocation);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      const fallbackLocation = {
        address: "Cross Street 4, Kasturba Nagar, Adyar",
        ward: "Ward 12",
        district: "Chennai South",
        lat: 13.0067,
        lng: 80.2571
      };
      setLocData(fallbackLocation);
      if (onLocationChange) onLocationChange(fallbackLocation);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onLocationChange) onLocationChange(locData);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.85rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MapPin size={18} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Geographical Location
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleUseCurrent}
            disabled={isLocating}
            title="Detect GPS"
          >
            {isLocating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation size={13} />
                <span>Use Current Location</span>
              </>
            )}
          </button>
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={13} />
              Change Location
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
            >
              <Check size={13} />
              Save
            </button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
            backgroundColor: "var(--bg-subtle)",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)"
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Address / Locality
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {locData.address}
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Ward & District
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {locData.ward}, {locData.district}
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Coordinates
            </span>
            <span style={{ fontSize: "0.875rem", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              {Number(locData.lat).toFixed(4)}° N, {Number(locData.lng).toFixed(4)}° E
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted">Street Address</label>
            <input
              type="text"
              className="input-field"
              value={locData.address}
              onChange={(e) => setLocData({ ...locData, address: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted">Ward</label>
            <input
              type="text"
              className="input-field"
              value={locData.ward}
              onChange={(e) => setLocData({ ...locData, ward: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs text-muted">District</label>
            <input
              type="text"
              className="input-field"
              value={locData.district}
              onChange={(e) => setLocData({ ...locData, district: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
