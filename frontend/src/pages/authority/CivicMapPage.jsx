import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  ExternalLink,
  ArrowRight,
  Layers,
  Compass,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  MapPinOff,
  SlidersHorizontal,
  Navigation
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import StatusBadge from "../../components/common/StatusBadge";
import SeverityBadge from "../../components/common/SeverityBadge";
import { useCivicData } from "../../context/CivicDataContext";
import { CIVIC_CATEGORIES } from "../../data/mockData";
import { AUTHORITY_STATUSES } from "./AuthorityComplaintsPage";

/**
 * Validates and extracts numeric GPS coordinates from a complaint.
 * Complies with requirement 4 & 10 (excludes complaints without valid coordinates).
 */
export function getValidCoordinates(complaint) {
  if (!complaint) return null;
  const lat =
    complaint.location?.latitude ??
    complaint.location?.lat ??
    complaint.latitude ??
    complaint.coordinates?.lat;
  const lng =
    complaint.location?.longitude ??
    complaint.location?.lng ??
    complaint.longitude ??
    complaint.coordinates?.lng;

  if (lat == null || lng == null) return null;
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) return null;
  if (numLat === 0 && numLng === 0) return null;
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) return null;

  return { lat: numLat, lng: numLng };
}

/**
 * Formats date into human-readable string
 */
function formatSubmissionDate(dateStr) {
  if (!dateStr) return "Date unavailable";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Date unavailable";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "Date unavailable";
  }
}

/**
 * Creates custom severity-coded SVG pin icons using Leaflet divIcon.
 * Eliminates bundler asset resolution issues and matches CivicAI design system.
 */
/**
 * Creates custom severity-coded SVG pin icons using Leaflet divIcon.
 * Eliminates bundler asset resolution issues and matches CivicAI design system.
 */
function createCustomMarkerIcon(severity, isSelected) {
  const color =
    severity === "Critical"
      ? "#7F1D1D"
      : severity === "High"
      ? "#C53030"
      : severity === "Medium"
      ? "#B7791F"
      : "#238636";

  const size = isSelected ? 34 : 26;
  const stroke = isSelected ? "#123B63" : "#ffffff";
  const strokeWidth = isSelected ? 3 : 2;

  return L.divIcon({
    className: "civic-leaflet-marker-wrapper",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${strokeWidth}px solid ${stroke};
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease-in-out;
      ">
        <div style="
          width: ${Math.round(size * 0.4)}px;
          height: ${Math.round(size * 0.4)}px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
}

/**
 * Controller subcomponent to programmatically synchronize Leaflet view bounds.
 */
function MapViewController({ bounds, focusedLocation, viewMode }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // Ensure Leaflet recalculates dimensions when rendered in responsive grid
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (viewMode === "focus" && focusedLocation) {
      map.flyTo([focusedLocation.lat, focusedLocation.lng], 16, {
        animate: true,
        duration: 0.8
      });
    } else if (bounds && bounds.length > 0) {
      try {
        if (bounds.length === 1) {
          map.setView(bounds[0], 15, { animate: true });
        } else {
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 16
          });
        }
      } catch (err) {
        console.warn("Could not fit map bounds:", err);
      }
    }
  }, [map, bounds, focusedLocation, viewMode]);

  return null;
}

export default function CivicMapPage() {
  // Read real-time Firestore complaints from existing CivicDataContext
  const { complaints } = useCivicData();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchId, setSearchId] = useState("");
  const [viewMode, setViewMode] = useState("fit"); // 'fit' | 'focus'

  // Selected complaint state
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Section 18 predefined category filters: All, Water, Roads, Waste, Street Lights, Healthcare, Education
  const CATEGORY_FILTERS = [
    "All",
    "Water",
    "Roads",
    "Waste",
    "Street Lights",
    "Healthcare",
    "Education"
  ];

  // Match category helper
  const matchCategory = (complaintCategory, selected) => {
    if (selected === "All") return true;
    const cat = (complaintCategory || "").toLowerCase();
    if (selected === "Water") return cat.includes("water");
    if (selected === "Roads") return cat.includes("road") || cat.includes("transport");
    if (selected === "Waste") return cat.includes("waste") || cat.includes("sanitation") || cat.includes("garbage");
    if (selected === "Street Lights") return cat.includes("light") || cat.includes("lamp");
    if (selected === "Healthcare") return cat.includes("health") || cat.includes("hospital");
    if (selected === "Education") return cat.includes("school") || cat.includes("education");
    return cat === selected.toLowerCase();
  };

  // Filter complaints based on criteria
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // 1. Category Filter (supports canonical Section 18 filters)
      if (!matchCategory(c.category, selectedCategory)) {
        return false;
      }
      // 2. Severity Filter
      if (selectedSeverity !== "All" && c.severity !== selectedSeverity) {
        return false;
      }
      // 3. Status Filter
      if (selectedStatus !== "All") {
        const normCStatus = (c.status || "").toUpperCase().replace(/[\s-]/g, "_");
        const normFilterStatus = selectedStatus.toUpperCase().replace(/[\s-]/g, "_");
        if (normCStatus !== normFilterStatus) return false;
      }
      // 4. Complaint ID Search
      if (searchId.trim()) {
        const query = searchId.trim().toLowerCase();
        const idMatch = (c.id || "").toLowerCase().includes(query) ||
                        (c.complaintId || "").toLowerCase().includes(query);
        const titleMatch = (c.title || "").toLowerCase().includes(query);
        if (!idMatch && !titleMatch) return false;
      }
      return true;
    });
  }, [complaints, selectedCategory, selectedSeverity, selectedStatus, searchId]);

  // Separate complaints with valid GPS coordinates from those without
  const { validComplaints, missingCoordsCount } = useMemo(() => {
    const valid = [];
    let missing = 0;

    filteredComplaints.forEach((c) => {
      const coords = getValidCoordinates(c);
      if (coords) {
        valid.push({ ...c, coords });
      } else {
        missing++;
      }
    });

    return { validComplaints: valid, missingCoordsCount: missing };
  }, [filteredComplaints]);

  // Coordinates array for Leaflet fitBounds
  const boundsPoints = useMemo(() => {
    if (validComplaints.length === 0) return null;
    return validComplaints.map((c) => [c.coords.lat, c.coords.lng]);
  }, [validComplaints]);

  // Get full complaint object for currently selected complaint
  const selectedComplaint = useMemo(() => {
    if (!selectedComplaintId) return null;
    return (
      validComplaints.find(
        (c) => (c.id || c.complaintId) === selectedComplaintId
      ) ||
      complaints.find((c) => (c.id || c.complaintId) === selectedComplaintId) ||
      null
    );
  }, [selectedComplaintId, validComplaints, complaints]);

  const selectedComplaintCoords = useMemo(() => {
    return getValidCoordinates(selectedComplaint);
  }, [selectedComplaint]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedSeverity("All");
    setSelectedStatus("All");
    setSearchId("");
    setViewMode("fit");
  };

  const handleFitAll = () => {
    setViewMode("fit");
  };

  const handleFocusSelected = () => {
    if (selectedComplaintCoords) {
      setViewMode("focus");
    }
  };

  // Severity summary counter matching Section 18 legend
  const severityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    validComplaints.forEach((c) => {
      if (c.severity === "Critical") counts.Critical++;
      else if (c.severity === "High") counts.High++;
      else if (c.severity === "Medium") counts.Medium++;
      else counts.Low++;
    });
    return counts;
  }, [validComplaints]);

  // Default center: Central Chennai
  const defaultCenter = [13.0667, 80.2571];

  return (
    <div className="page-container" style={{ paddingBottom: "2.5rem" }}>
      {/* Page Header (Section 18) */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(18, 59, 99, 0.1)",
                  color: "#123B63"
                }}
              >
                <Compass size={17} />
              </span>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "#123B63" }}>
                Civic Issue Map
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              Geospatial visualization of citizen complaints across municipal wards.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "6px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                fontSize: "0.82rem"
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Visible on Map:</span>
              <strong style={{ color: "#123B63" }}>{validComplaints.length}</strong>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ color: "var(--text-muted)" }}>{complaints.length} total</span>
            </div>

            {missingCoordsCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: "rgba(100, 116, 139, 0.08)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)"
                }}
                title="Complaints without GPS coordinates are safely excluded from map markers"
              >
                <MapPinOff size={13} />
                <span>{missingCoordsCount} off-map</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <SlidersHorizontal size={15} style={{ color: "#123B63" }} />
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#123B63" }}>Filters &amp; Severity Legend</span>
          </div>

          {/* Section 18: Severity Legend (Critical, High, Medium, Low) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#7F1D1D" }}></span>
              <span style={{ fontWeight: 600 }}>Critical ({severityCounts.Critical})</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#C53030" }}></span>
              <span style={{ fontWeight: 600 }}>High ({severityCounts.High})</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#B7791F" }}></span>
              <span style={{ fontWeight: 600 }}>Medium ({severityCounts.Medium})</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#238636" }}></span>
              <span style={{ fontWeight: 600 }}>Low ({severityCounts.Low})</span>
            </span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem"
          }}
        >
          {/* Complaint ID / Keyword Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search by ID or keywords..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.25rem", fontSize: "0.85rem", height: "38px" }}
            />
          </div>

          {/* Section 18 Category Filter (All, Water, Roads, Waste, Street Lights, Healthcare, Education) */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              {CATEGORY_FILTERS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input-field"
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              <option value="All">All Statuses</option>
              {AUTHORITY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Controls & Reset Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", paddingTop: "0.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handleFitAll}
              className={`btn btn-sm ${viewMode === "fit" ? "btn-secondary" : "btn-ghost"}`}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
              title="Fit map view to show all visible markers"
            >
              <Navigation size={13} style={{ transform: "rotate(45deg)" }} />
              <span>Fit All Markers</span>
            </button>

            {selectedComplaintCoords && (
              <button
                type="button"
                onClick={handleFocusSelected}
                className={`btn btn-sm ${viewMode === "focus" ? "btn-secondary" : "btn-ghost"}`}
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
                title="Focus map directly on selected complaint"
              >
                <MapPin size={13} />
                <span>Focus Selected ({selectedComplaint?.id || selectedComplaint?.complaintId})</span>
              </button>
            )}
          </div>

          {(selectedCategory !== "All" ||
            selectedSeverity !== "All" ||
            selectedStatus !== "All" ||
            searchId.trim()) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map & Detail Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.25rem",
          alignItems: "stretch"
        }}
        className="map-grid-layout"
      >
        {/* Map Viewport Area */}
        <div
          className="card"
          style={{
            position: "relative",
            minHeight: "560px",
            height: "640px",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 1
          }}
        >
          {/* Leaflet MapContainer */}
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <MapContainer
              center={defaultCenter}
              zoom={12}
              scrollWheelZoom={true}
              style={{ width: "100%", height: "100%" }}
            >
              {/* Standard OpenStreetMap Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {/* View Controller for dynamic bounds & flyTo */}
              <MapViewController
                bounds={boundsPoints}
                focusedLocation={selectedComplaintCoords}
                viewMode={viewMode}
              />

              {/* Complaint Markers */}
              {validComplaints.map((complaint) => {
                const id = complaint.id || complaint.complaintId;
                const isSelected = id === selectedComplaintId;
                const coords = complaint.coords;

                return (
                  <Marker
                    key={id}
                    position={[coords.lat, coords.lng]}
                    icon={createCustomMarkerIcon(complaint.severity, isSelected)}
                    eventHandlers={{
                      click: () => {
                        setSelectedComplaintId(id);
                        setViewMode("focus");
                      }
                    }}
                  >
                    {/* Complaint Popup Card */}
                    <Popup
                      className="civic-leaflet-popup"
                      maxWidth={300}
                      minWidth={250}
                      autoPan={true}
                      autoPanPadding={[50, 50]}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {/* Header: ID + Badges */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.5rem",
                            borderBottom: "1px solid var(--border-color, #e2e8f0)",
                            paddingBottom: "0.4rem"
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "var(--brand-primary, #2563eb)"
                            }}
                          >
                            {id}
                          </span>
                          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                            <SeverityBadge severity={complaint.severity || "Medium"} />
                            <StatusBadge status={complaint.status || "REPORTED"} />
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: "var(--text-muted, #64748b)",
                              textTransform: "uppercase",
                              letterSpacing: "0.03em"
                            }}
                          >
                            {complaint.category || "Civic Complaint"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "var(--text-primary, #1e293b)",
                              marginTop: "2px",
                              lineHeight: 1.3
                            }}
                          >
                            {complaint.title ||
                             complaint.originalTextEn ||
                             complaint.originalText ||
                             "Citizen Complaint"}
                          </div>
                        </div>

                        {/* Address & Locality */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.4rem",
                            fontSize: "0.75rem",
                            color: "var(--text-secondary, #475569)",
                            background: "var(--bg-subtle, #f8fafc)",
                            padding: "0.35rem 0.5rem",
                            borderRadius: "6px"
                          }}
                        >
                          <MapPin
                            size={13}
                            style={{
                              flexShrink: 0,
                              marginTop: "2px",
                              color: "var(--brand-primary, #2563eb)"
                            }}
                          />
                          <span style={{ lineHeight: 1.3 }}>
                            {complaint.location?.address ||
                             complaint.location?.display_name ||
                             complaint.location?.locality ||
                             (complaint.location?.district
                               ? `${complaint.location.ward || ""}, ${complaint.location.district}`
                               : null) ||
                             "Address not recorded"}
                          </span>
                        </div>

                        {/* Date Submitted & Coordinates */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.72rem",
                            color: "var(--text-muted, #64748b)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Calendar size={12} />
                            <span>
                              {formatSubmissionDate(
                                complaint.submittedAt || complaint.createdAt
                              )}
                            </span>
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                          </span>
                        </div>

                        {/* Manage Complaint Link */}
                        <Link
                          to={`/authority/complaints?id=${id}`}
                          className="btn btn-primary btn-sm"
                          style={{
                            marginTop: "0.25rem",
                            padding: "0.35rem 0.6rem",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem",
                            textDecoration: "none"
                          }}
                        >
                          <span>Manage Complaint</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Empty State Overlay */}
            {validComplaints.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.88)",
                  backdropFilter: "blur(4px)",
                  zIndex: 1000,
                  padding: "2rem",
                  textAlign: "center"
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(100, 116, 139, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    marginBottom: "1rem"
                  }}
                >
                  <MapPinOff size={28} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  No Complaint Markers Found
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "340px", marginBottom: "1.25rem" }}>
                  {filteredComplaints.length === 0
                    ? "No complaints match the current filter selection."
                    : "The filtered complaints do not contain valid GPS coordinates."}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm"
                >
                  <RotateCcw size={13} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right-Hand Inspection Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {selectedComplaint ? (
            <div
              className="card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                height: "100%"
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid var(--border-color)"
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--brand-primary)"
                    }}
                  >
                    {selectedComplaint.id || selectedComplaint.complaintId}
                  </span>
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      margin: "0.2rem 0 0 0",
                      lineHeight: 1.3
                    }}
                  >
                    {selectedComplaint.title ||
                     selectedComplaint.originalTextEn ||
                     selectedComplaint.originalText ||
                     "Civic Complaint"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "0.2rem", color: "var(--text-muted)" }}
                  title="Close inspection panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status & Severity */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap"
                }}
              >
                <SeverityBadge severity={selectedComplaint.severity || "Medium"} />
                <StatusBadge status={selectedComplaint.status || "REPORTED"} />
              </div>

              {/* Metadata Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8rem", flex: 1 }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>
                    Category
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedComplaint.category || "General"}
                    {selectedComplaint.subcategory ? ` · ${selectedComplaint.subcategory}` : ""}
                  </span>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>
                    Captured Location
                  </span>
                  <div
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-subtle)",
                      border: "1px solid var(--border-color)",
                      marginTop: "0.2rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                      <MapPin size={14} style={{ color: "var(--brand-primary)", marginTop: "2px", flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.35 }}>
                        {selectedComplaint.location?.address ||
                         selectedComplaint.location?.display_name ||
                         selectedComplaint.location?.locality ||
                         (selectedComplaint.location?.district
                           ? `${selectedComplaint.location.ward || ""}, ${selectedComplaint.location.district}`
                           : null) ||
                         "Address details not recorded"}
                      </span>
                    </div>

                    {selectedComplaintCoords && (
                      <div
                        style={{
                          marginTop: "0.4rem",
                          paddingTop: "0.4rem",
                          borderTop: "1px dashed var(--border-color)",
                          fontFamily: "monospace",
                          fontSize: "0.72rem",
                          color: "var(--text-secondary)",
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <span>Lat: {selectedComplaintCoords.lat.toFixed(6)}</span>
                        <span>Lng: {selectedComplaintCoords.lng.toFixed(6)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedComplaint.aiAnalysis?.summary && (
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>
                      AI Summary
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.78rem",
                        lineHeight: 1.4,
                        color: "var(--text-secondary)"
                      }}
                    >
                      {selectedComplaint.aiAnalysis.summary}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    <Calendar size={13} />
                    <span>Submitted: {formatSubmissionDate(selectedComplaint.submittedAt || selectedComplaint.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link
                  to={`/authority/complaints?id=${selectedComplaint.id || selectedComplaint.complaintId}`}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <span>Manage Status & Dispatch</span>
                  <ArrowRight size={14} />
                </Link>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    to={`/citizen/complaints/${selectedComplaint.id || selectedComplaint.complaintId}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: "center", fontSize: "0.75rem" }}
                  >
                    Citizen View
                  </Link>

                  {selectedComplaintCoords && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selectedComplaintCoords.lat}&mlon=${selectedComplaintCoords.lng}#map=16/${selectedComplaintCoords.lat}/${selectedComplaintCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                      title="Open on OpenStreetMap"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
                textAlign: "center",
                color: "var(--text-muted)"
              }}
            >
              <MapPin size={36} style={{ marginBottom: "0.75rem", opacity: 0.5 }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                No Complaint Selected
              </h4>
              <p style={{ fontSize: "0.8rem", margin: 0 }}>
                Click any marker on the map to inspect complaint details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map styling enhancements for Leaflet */}
      <style>{`
        .leaflet-container {
          font-family: inherit;
          background: #f1f5f9;
          z-index: 1;
        }

        .civic-leaflet-marker-wrapper {
          background: transparent;
          border: none;
        }

        .civic-leaflet-popup .leaflet-popup-content-wrapper {
          background: var(--bg-surface, #ffffff);
          color: var(--text-primary, #1e293b);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          padding: 0;
        }

        .civic-leaflet-popup .leaflet-popup-tip {
          background: var(--bg-surface, #ffffff);
        }

        .civic-leaflet-popup .leaflet-popup-content {
          margin: 0;
          padding: 12px 14px;
          line-height: 1.4;
        }

        @media (max-width: 960px) {
          .map-grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
