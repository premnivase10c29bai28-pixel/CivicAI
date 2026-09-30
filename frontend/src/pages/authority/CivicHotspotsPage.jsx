import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  MapPin,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  AlertTriangle,
  ArrowRight,
  Info,
  MapPinOff,
  Navigation,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Building2,
  Activity
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import StatusBadge from "../../components/common/StatusBadge";
import SeverityBadge from "../../components/common/SeverityBadge";
import CivicDevelopmentInsightCard from "../../components/common/CivicDevelopmentInsightCard";
import { useCivicData } from "../../context/CivicDataContext";
import { CIVIC_CATEGORIES } from "../../data/mockData";
import { AUTHORITY_STATUSES } from "./AuthorityComplaintsPage";
import {
  detectHotspots,
  getValidCoordinates,
  haversineDistanceKm
} from "../../services/hotspotService";

/**
 * Creates custom pulsing Leaflet divIcon marker for hotspots.
 */
function createHotspotMarkerIcon(hotspot, isSelected) {
  const isHigh =
    hotspot.highestSeverity === "High" || hotspot.prototypeScore >= 75;
  const isMed =
    hotspot.highestSeverity === "Medium" || hotspot.prototypeScore >= 50;

  const bgColor = isHigh ? "#ea580c" : isMed ? "#f59e0b" : "#2563eb";
  const size = isSelected ? 44 : 38;
  const ringColor = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.9)";
  const ringWidth = isSelected ? 3 : 2;

  return L.divIcon({
    className: "civic-hotspot-leaflet-icon",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${bgColor};
          opacity: 0.3;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: ${size - 6}px;
          height: ${size - 6}px;
          background: ${bgColor};
          border: ${ringWidth}px solid ${ringColor};
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
        ">
          <span style="font-size: 0.6rem; line-height: 1; letter-spacing: -0.02em; font-family: monospace;">
            ${hotspot.id}
          </span>
          <span style="font-size: 0.72rem; line-height: 1; font-weight: 800; margin-top: 1px;">
            ${hotspot.complaintCount}
          </span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

/**
 * Creates secondary green clinic pin icon for nearby GCC Health Centres.
 */
function createFacilityMarkerIcon(facility) {
  return L.divIcon({
    className: "gcc-facility-leaflet-icon",
    html: `
      <div style="
        width: 26px;
        height: 26px;
        background-color: #16a34a;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
      " title="GCC Health Facility: ${facility.facilityName}">
        +
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
}

/**
 * Controller subcomponent to programmatically synchronize Leaflet view.
 */
function HotspotMapController({ bounds, selectedHotspot, viewMode }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (viewMode === "focus" && selectedHotspot) {
      map.flyTo([selectedHotspot.centerLat, selectedHotspot.centerLng], 14, {
        animate: true,
        duration: 0.8
      });
    } else if (bounds && bounds.length > 0) {
      try {
        if (bounds.length === 1) {
          map.setView(bounds[0], 13, { animate: true });
        } else {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14
          });
        }
      } catch (err) {
        console.warn("Could not fit hotspot map bounds:", err);
      }
    }
  }, [map, bounds, selectedHotspot, viewMode]);

  return null;
}

export default function CivicHotspotsPage() {
  const { complaints } = useCivicData();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [clusteringRadiusKm, setClusteringRadiusKm] = useState(2.0); // Default 2.0 km MVP
  const [viewMode, setViewMode] = useState("fit"); // 'fit' | 'focus'

  // Selected Hotspot for interaction
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);

  // Derive unique categories from existing data + CIVIC_CATEGORIES
  const categoryOptions = useMemo(() => {
    const set = new Set();
    CIVIC_CATEGORIES.forEach((c) => set.add(c.name));
    complaints.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set)];
  }, [complaints]);

  // Total complaints with valid GPS coordinates in database
  const totalGpsComplaintsCount = useMemo(() => {
    return complaints.filter((c) => getValidCoordinates(c) !== null).length;
  }, [complaints]);

  // Step 1: Filter raw complaints by authority criteria
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // 1. Category Filter
      if (selectedCategory !== "All" && c.category !== selectedCategory) {
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
      return true;
    });
  }, [complaints, selectedCategory, selectedSeverity, selectedStatus]);

  // Step 2: Dynamically detect hotspots from filtered complaints with valid coordinates
  const detectedHotspots = useMemo(() => {
    return detectHotspots(filteredComplaints, {
      radiusKm: Number(clusteringRadiusKm),
      minComplaints: 2 // MVP requirement: at least 2 complaints
    });
  }, [filteredComplaints, clusteringRadiusKm]);

  // Map center/bounds
  const boundsPoints = useMemo(() => {
    if (detectedHotspots.length === 0) return null;
    return detectedHotspots.map((h) => [h.centerLat, h.centerLng]);
  }, [detectedHotspots]);

  // Selected hotspot object
  const selectedHotspot = useMemo(() => {
    if (!selectedHotspotId) return null;
    return detectedHotspots.find((h) => h.id === selectedHotspotId) || null;
  }, [selectedHotspotId, detectedHotspots]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedSeverity("All");
    setSelectedStatus("All");
    setClusteringRadiusKm(2.0);
    setSelectedHotspotId(null);
    setViewMode("fit");
  };

  const handleSelectHotspot = (hotspot) => {
    setSelectedHotspotId(hotspot.id);
    setViewMode("focus");
  };

  const handleFitAll = () => {
    setViewMode("fit");
  };

  // Default center: Chennai
  const defaultCenter = [13.0667, 80.2571];

  return (
    <div className="page-container" style={{ paddingBottom: "3rem" }}>
      {/* Page Header */}
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
                <Flame size={17} />
              </span>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "#123B63" }}>
                Civic Hotspots
              </h1>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(35, 134, 54, 0.12)",
                  color: "#238636",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                <Building2 size={11} />
                GCC Public Data Connected
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, fontWeight: 500 }}>
              Areas with recurring or concentrated civic complaints.
            </p>
          </div>

          {/* Quick Metrics */}
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
              <span style={{ color: "var(--text-secondary)" }}>Detected Hotspots:</span>
              <strong style={{ color: "#123B63", fontSize: "0.95rem" }}>
                {detectedHotspots.length}
              </strong>
            </div>

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
              <span style={{ color: "var(--text-secondary)" }}>Clustering Radius:</span>
              <strong style={{ color: "#1769AA" }}>{clusteringRadiusKm} km</strong>
            </div>
          </div>
        </div>

        {/* Mandatory Regulatory / Prototype Notice */}
        <div
          style={{
            marginTop: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.65rem 0.95rem",
            borderRadius: "6px",
            backgroundColor: "#fff7ed",
            border: "1px solid rgba(232, 138, 26, 0.4)",
            fontSize: "0.82rem",
            color: "#17202A"
          }}
        >
          <Info size={16} style={{ color: "#B7791F", flexShrink: 0 }} />
          <span>
            <strong>Civic Analysis Notice:</strong> Prototype hotspot score — not an official government classification. Spatial clusters are generated for civic decision support.
          </span>
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
            <SlidersHorizontal size={15} style={{ color: "var(--brand-primary)" }} />
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Filter & Cluster Settings</span>
          </div>

          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Analyzing {filteredComplaints.length} complaints ({filteredComplaints.filter(c => getValidCoordinates(c) !== null).length} with GPS)
          </span>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem"
          }}
        >
          {/* Category Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: 500 }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              <option value="All">All Categories</option>
              {categoryOptions
                .filter((c) => c !== "All")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: 500 }}>
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input-field"
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              <option value="All">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: 500 }}>
              Complaint Status
            </label>
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

          {/* Cluster Radius Config */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: 500 }}>
              Clustering Radius
            </label>
            <select
              value={clusteringRadiusKm}
              onChange={(e) => setClusteringRadiusKm(Number(e.target.value))}
              className="input-field"
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              <option value={1.0}>1.0 km (Local Block)</option>
              <option value={1.5}>1.5 km (Ward Sector)</option>
              <option value={2.0}>2.0 km (Standard MVP)</option>
              <option value={2.5}>2.5 km (Sub-Zone)</option>
              <option value={3.0}>3.0 km (Municipal Zone)</option>
              <option value={5.0}>5.0 km (Wide Corridor)</option>
            </select>
          </div>
        </div>

        {/* View Controls & Reset */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", paddingTop: "0.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handleFitAll}
              className={`btn btn-sm ${viewMode === "fit" ? "btn-secondary" : "btn-ghost"}`}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
              title="Fit map view to show all detected hotspots"
            >
              <Navigation size={13} style={{ transform: "rotate(45deg)" }} />
              <span>Fit All Hotspots</span>
            </button>

            {selectedHotspot && (
              <span style={{ fontSize: "0.78rem", color: "#ea580c", fontWeight: 600 }}>
                Focused: {selectedHotspot.id} ({selectedHotspot.area})
              </span>
            )}
          </div>

          {(selectedCategory !== "All" ||
            selectedSeverity !== "All" ||
            selectedStatus !== "All" ||
            clusteringRadiusKm !== 2.0) && (
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

      {/* Main Map & Hotspot Inspector Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "1.25rem",
          alignItems: "stretch",
          marginBottom: "1.5rem"
        }}
        className="hotspot-grid-layout"
      >
        {/* Leaflet Hotspot Map */}
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

              {/* View Controller */}
              <HotspotMapController
                bounds={boundsPoints}
                selectedHotspot={selectedHotspot}
                viewMode={viewMode}
              />

              {/* Render Hotspot Circles & Markers */}
              {detectedHotspots.map((hotspot) => {
                const isSelected = hotspot.id === selectedHotspotId;
                const isHigh =
                  hotspot.highestSeverity === "High" || hotspot.prototypeScore >= 75;
                const circleColor = isHigh ? "#ea580c" : "#f59e0b";

                return (
                  <React.Fragment key={hotspot.id}>
                    {/* Geographic Cluster Radius Circle */}
                    <Circle
                      center={[hotspot.centerLat, hotspot.centerLng]}
                      radius={hotspot.clusteringRadiusKm * 1000}
                      pathOptions={{
                        color: circleColor,
                        fillColor: circleColor,
                        fillOpacity: isSelected ? 0.25 : 0.15,
                        weight: isSelected ? 2.5 : 1.5,
                        dashArray: isSelected ? undefined : "5, 5"
                      }}
                      eventHandlers={{
                        click: () => handleSelectHotspot(hotspot)
                      }}
                    />

                    {/* Central Hotspot Marker Pin */}
                    <Marker
                      position={[hotspot.centerLat, hotspot.centerLng]}
                      icon={createHotspotMarkerIcon(hotspot, isSelected)}
                      eventHandlers={{
                        click: () => handleSelectHotspot(hotspot)
                      }}
                    >
                      {/* Leaflet Hotspot Popup */}
                      <Popup
                        className="civic-leaflet-popup"
                        maxWidth={320}
                        minWidth={260}
                        autoPan={true}
                        autoPanPadding={[50, 50]}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {/* Header */}
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
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 800,
                                  fontSize: "0.9rem",
                                  color: "#ea580c"
                                }}
                              >
                                {hotspot.id}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                • {hotspot.area}
                              </span>
                            </div>
                            <div
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                                backgroundColor: "rgba(234, 88, 12, 0.12)",
                                color: "#ea580c",
                                fontWeight: 700,
                                fontSize: "0.75rem"
                              }}
                            >
                              Score: {hotspot.prototypeScore}/100
                            </div>
                          </div>

                          {/* Key Telemetry */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "0.4rem",
                              fontSize: "0.75rem",
                              backgroundColor: "var(--bg-subtle, #f8fafc)",
                              padding: "0.4rem 0.6rem",
                              borderRadius: "6px"
                            }}
                          >
                            <div>
                              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.68rem" }}>
                                Category
                              </span>
                              <strong>{hotspot.dominantCategory}</strong>
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.68rem" }}>
                                Complaints
                              </span>
                              <strong style={{ color: "var(--brand-primary, #2563eb)" }}>
                                {hotspot.complaintCount} tickets
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.68rem" }}>
                                Highest Severity
                              </span>
                              <SeverityBadge severity={hotspot.highestSeverity} />
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.68rem" }}>
                                Recent Activity
                              </span>
                              <span style={{ color: "#ea580c", fontWeight: 600 }}>
                                {hotspot.recentActivity}
                              </span>
                            </div>
                          </div>

                          {/* Public Health Evidence in Popup */}
                          <div
                            style={{
                              padding: "0.35rem 0.5rem",
                              borderRadius: "5px",
                              backgroundColor: hotspot.hasPublicDataContext
                                ? "rgba(22, 163, 74, 0.08)"
                                : "rgba(100, 116, 139, 0.08)",
                              fontSize: "0.72rem",
                              border: hotspot.hasPublicDataContext
                                ? "1px solid rgba(22, 163, 74, 0.25)"
                                : "1px solid var(--border-color, #e2e8f0)"
                            }}
                          >
                            {hotspot.hasPublicDataContext ? (
                              <div style={{ color: "#15803d" }}>
                                <strong>✓ GCC Health Facility Nearby:</strong>
                                <div style={{ fontSize: "0.68rem", marginTop: "1px", color: "var(--text-primary)" }}>
                                  {hotspot.publicHealthEvidence.nearestFacilityName} ({hotspot.publicHealthEvidence.nearestFacilityDistanceKm} km)
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>
                                No GCC health facility within 1 km
                              </span>
                            )}
                          </div>

                          {/* Center Coordinates */}
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                            <span>Center Coordinates:</span>
                            <span style={{ fontFamily: "monospace" }}>
                              {hotspot.centerLat.toFixed(4)}, {hotspot.centerLng.toFixed(4)}
                            </span>
                          </div>

                          {/* Member Complaints Preview */}
                          <div style={{ borderTop: "1px solid var(--border-color, #e2e8f0)", paddingTop: "0.4rem" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                              Member Complaints ({hotspot.memberComplaints.length}):
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "90px", overflowY: "auto" }}>
                              {hotspot.memberComplaints.map((c) => (
                                <Link
                                  key={c.id || c.complaintId}
                                  to={`/authority/complaints?id=${c.id || c.complaintId}`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    fontSize: "0.72rem",
                                    padding: "0.2rem 0.4rem",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(0,0,0,0.03)",
                                    textDecoration: "none",
                                    color: "inherit"
                                  }}
                                >
                                  <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                                    {c.id || c.complaintId}
                                  </span>
                                  <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>
                                    {c.category}
                                  </span>
                                  <ArrowRight size={11} style={{ opacity: 0.6 }} />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}

              {/* Secondary Markers for Nearby GCC Health Facilities (Only when a hotspot is selected) */}
              {selectedHotspot &&
                selectedHotspot.publicHealthEvidence?.nearbyFacilities?.map((fac) => (
                  <Marker
                    key={`gcc-fac-${fac.id}`}
                    position={[fac.latitude, fac.longitude]}
                    icon={createFacilityMarkerIcon(fac)}
                  >
                    <Popup className="civic-leaflet-popup" maxWidth={280}>
                      <div style={{ fontSize: "0.75rem", lineHeight: 1.35 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#16a34a", fontWeight: 700, marginBottom: "0.2rem" }}>
                          <span>🏥 Greater Chennai Corporation {fac.facilityType}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.82rem" }}>
                          {fac.facilityName}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                          {fac.address}
                        </div>
                        {fac.ward && (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", marginTop: "0.15rem" }}>
                            Ward {fac.ward} • Zone {fac.zone} • Dept: {fac.department}
                          </div>
                        )}
                        <div style={{ marginTop: "0.35rem", paddingTop: "0.3rem", borderTop: "1px dashed var(--border-color)", color: "#15803d", fontSize: "0.72rem", fontWeight: 600 }}>
                          {fac.distanceKm} km from hotspot center
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            {/* Empty State Overlay */}
            {detectedHotspots.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
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
                    backgroundColor: "rgba(234, 88, 12, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ea580c",
                    marginBottom: "1rem"
                  }}
                >
                  <MapPinOff size={28} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  {totalGpsComplaintsCount === 0
                    ? "No Complaints with GPS Coordinates"
                    : filteredComplaints.length < 2
                    ? "Insufficient Complaints for Hotspot Clustering"
                    : "No Hotspots Detected"}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "360px", marginBottom: "1.25rem", lineHeight: 1.4 }}>
                  {totalGpsComplaintsCount === 0
                    ? "None of the submitted complaints currently contain GPS coordinates."
                    : filteredComplaints.length < 2
                    ? "Hotspot detection requires at least 2 geographically clustered complaints within the configured radius."
                    : `No geographic clusters found with ≥ 2 complaints within ${clusteringRadiusKm} km under current filter criteria.`}
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

        {/* Selected Hotspot Detailed Inspection Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {selectedHotspot ? (
            <div
              className="card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderTop: "4px solid #ea580c"
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 800,
                        fontSize: "1rem",
                        color: "#ea580c"
                      }}
                    >
                      {selectedHotspot.id}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      ({selectedHotspot.clusteringRadiusKm} km cluster)
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      margin: "0.2rem 0 0 0",
                      lineHeight: 1.3
                    }}
                  >
                    {selectedHotspot.area}
                  </h3>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "6px",
                    backgroundColor: "rgba(234, 88, 12, 0.12)",
                    border: "1px solid rgba(234, 88, 12, 0.25)"
                  }}
                >
                  <span style={{ fontSize: "0.62rem", color: "#ea580c", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                    Hotspot Score
                  </span>
                  <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ea580c" }}>
                    {selectedHotspot.prototypeScore}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>/100</span>
                </div>
              </div>

              {/* Civic Development Insight Card (Synthesized Decision Support) */}
              <div style={{ marginBottom: "0.85rem" }}>
                <CivicDevelopmentInsightCard hotspot={selectedHotspot} />
              </div>

              {/* Score Breakdown (Requirement 5 & Public Data Context) */}
              <div
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-subtle)",
                  border: "1px solid var(--border-color)",
                  marginBottom: "0.85rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Prototype Hotspot Score
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    Weighted (100%)
                  </span>
                </div>
                <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "0.45rem" }}>
                  Prototype hotspot score — not an official government classification.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.73rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Complaint Count (40%):</span>
                    <strong>+{selectedHotspot.scoreBreakdown.countScore} pts</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Recent Activity (30%):</span>
                    <strong>+{selectedHotspot.scoreBreakdown.recentScore} pts</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Severity Weight (20%):</span>
                    <strong>+{selectedHotspot.scoreBreakdown.severityScore} pts</strong>
                  </div>
                  {/* Public Data Context: participating in the score! */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: selectedHotspot.hasPublicDataContext ? "#15803d" : "var(--text-secondary)",
                      fontWeight: selectedHotspot.hasPublicDataContext ? 600 : 400
                    }}
                  >
                    <span>Public Data Context (10%):</span>
                    <strong>
                      {selectedHotspot.scoreBreakdown.publicDataScore > 0
                        ? `+${selectedHotspot.scoreBreakdown.publicDataScore} pts`
                        : "0 pts"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Public Health Context Evidence Card */}
              <div
                style={{
                  padding: "0.65rem 0.75rem",
                  borderRadius: "8px",
                  backgroundColor: selectedHotspot.hasPublicDataContext
                    ? "rgba(22, 163, 74, 0.08)"
                    : "var(--bg-subtle)",
                  border: selectedHotspot.hasPublicDataContext
                    ? "1px solid rgba(22, 163, 74, 0.25)"
                    : "1px solid var(--border-color)",
                  marginBottom: "0.85rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Building2
                      size={14}
                      style={{ color: selectedHotspot.hasPublicDataContext ? "#16a34a" : "var(--text-muted)" }}
                    />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: selectedHotspot.hasPublicDataContext ? "#15803d" : "var(--text-muted)",
                        textTransform: "uppercase"
                      }}
                    >
                      Public Health Context
                    </span>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    GCC Open Data (&le; 1 km)
                  </span>
                </div>

                {selectedHotspot.hasPublicDataContext ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.75rem" }}>
                    <div style={{ color: "#15803d", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <CheckCircle2 size={13} />
                      <span>
                        {selectedHotspot.publicHealthEvidence.nearbyFacilityCount} GCC health {selectedHotspot.publicHealthEvidence.nearbyFacilityCount === 1 ? "facility" : "facilities"} within 1 km
                      </span>
                    </div>

                    <div style={{ color: "var(--text-secondary)", lineHeight: 1.35 }}>
                      <div>
                        <strong>Nearest: </strong>
                        <span>{selectedHotspot.publicHealthEvidence.nearestFacilityName}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginLeft: "0.3rem" }}>
                          ({selectedHotspot.publicHealthEvidence.nearestFacilityType})
                        </span>
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "2px" }}>
                        Distance: <strong style={{ color: "var(--text-primary)" }}>{selectedHotspot.publicHealthEvidence.nearestFacilityDistanceKm} km</strong>
                        {" • "}{selectedHotspot.publicHealthEvidence.nearestFacilityAddress}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                    <div>No GCC health facility found within 1 km</div>
                    {selectedHotspot.publicHealthEvidence.nearestFacilityName && (
                      <div style={{ fontSize: "0.68rem", marginTop: "2px", opacity: 0.85 }}>
                        Nearest is {selectedHotspot.publicHealthEvidence.nearestFacilityName} at {selectedHotspot.publicHealthEvidence.nearestFacilityDistanceKm} km.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cluster Key Facts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.8rem", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Dominant Category:</span>
                  <strong style={{ color: "var(--brand-primary)" }}>{selectedHotspot.dominantCategory}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Highest Severity:</span>
                  <SeverityBadge severity={selectedHotspot.highestSeverity} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Clustered Complaints:</span>
                  <strong>{selectedHotspot.complaintCount} tickets</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Recent Complaints:</span>
                  <span style={{ color: "#ea580c", fontWeight: 600 }}>{selectedHotspot.recentActivity}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Center Coordinates:</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {selectedHotspot.centerLat.toFixed(4)}, {selectedHotspot.centerLng.toFixed(4)}
                  </span>
                </div>

                {/* Member Complaint List */}
                <div style={{ marginTop: "0.35rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "0.35rem" }}>
                    Clustered Complaints ({selectedHotspot.memberComplaints.length})
                  </span>
                  <div
                    style={{
                      maxHeight: "110px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                      paddingRight: "0.25rem"
                    }}
                  >
                    {selectedHotspot.memberComplaints.map((c) => (
                      <Link
                        key={c.id || c.complaintId}
                        to={`/authority/complaints?id=${c.id || c.complaintId}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.35rem 0.5rem",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-subtle)",
                          border: "1px solid var(--border-color)",
                          textDecoration: "none",
                          color: "inherit",
                          fontSize: "0.75rem"
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--brand-primary)" }}>
                            {c.id || c.complaintId}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {c.category}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <SeverityBadge severity={c.severity || "Medium"} />
                          <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link
                  to={`/authority/complaints?search=${selectedHotspot.dominantCategory}`}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <span>Dispatch Remedial Crew</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedHotspotId(null)}
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.75rem" }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : detectedHotspots.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.2rem 0.25rem"
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    color: "var(--text-muted)"
                  }}
                >
                  Priority Hotspot Insight ({detectedHotspots[0].id})
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectHotspot(detectedHotspots[0])}
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: "0.72rem", color: "var(--brand-primary)", padding: "0.15rem 0.45rem" }}
                >
                  Inspect Full Hotspot →
                </button>
              </div>

              <CivicDevelopmentInsightCard hotspot={detectedHotspots[0]} />

              <div
                className="card"
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--text-muted)"
                }}
              >
                <Flame size={22} style={{ opacity: 0.6, color: "#ea580c" }} />
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>
                  {detectedHotspots.length} Civic Hotspot Clusters Active
                </div>
                <p style={{ fontSize: "0.75rem", margin: 0, lineHeight: 1.4 }}>
                  Click any hotspot circle on the map or cluster card below to inspect full member complaints and GCC health facility telemetry.
                </p>
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
              <Flame size={36} style={{ marginBottom: "0.75rem", opacity: 0.5, color: "#ea580c" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                No Hotspot Selected
              </h4>
              <p style={{ fontSize: "0.8rem", margin: 0 }}>
                Click any hotspot circle or card to inspect member tickets, GCC health infrastructure context, and score metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hotspot List / Cards Section (Requirement 7) */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
              Detected Hotspot Clusters ({detectedHotspots.length})
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              Click any card to center and zoom the map on that geographic cluster.
            </p>
          </div>

          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Threshold: &ge; 2 complaints within {clusteringRadiusKm} km
          </span>
        </div>

        {detectedHotspots.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.25rem"
            }}
          >
            {detectedHotspots.map((hotspot) => {
              const isSelected = hotspot.id === selectedHotspotId;
              const isHigh =
                hotspot.highestSeverity === "High" || hotspot.prototypeScore >= 75;

              return (
                <div
                  key={hotspot.id}
                  className="card"
                  onClick={() => handleSelectHotspot(hotspot)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    borderTop: isHigh ? "4px solid #ea580c" : "4px solid #f59e0b",
                    boxShadow: isSelected
                      ? "0 0 0 2px var(--brand-primary), 0 8px 20px rgba(0,0,0,0.12)"
                      : undefined
                  }}
                >
                  <div>
                    {/* Card Header: Hotspot ID & Prototype Score */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "0.75rem"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 800,
                              fontSize: "1.1rem",
                              color: isHigh ? "#ea580c" : "#f59e0b"
                            }}
                          >
                            Hotspot: {hotspot.id}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {hotspot.area}
                        </span>
                      </div>

                      {/* Prototype Score Badge */}
                      <div
                        style={{
                          textAlign: "right",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "6px",
                          backgroundColor: "rgba(234, 88, 12, 0.1)",
                          border: "1px solid rgba(234, 88, 12, 0.25)"
                        }}
                      >
                        <span style={{ fontSize: "0.62rem", color: "#ea580c", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                          Prototype Score
                        </span>
                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ea580c" }}>
                          {hotspot.prototypeScore}
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>/100</span>
                      </div>
                    </div>

                    {/* Standardized Information Table (Requirement 7) */}
                    <div
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.6rem",
                        marginBottom: "0.75rem",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      {/* Category */}
                      <div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                          Category
                        </span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                          {hotspot.dominantCategory}
                        </span>
                      </div>

                      {/* Complaints */}
                      <div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                          Complaints
                        </span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-primary)" }}>
                          {hotspot.complaintCount} tickets
                        </span>
                      </div>

                      {/* Highest Severity */}
                      <div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                          Highest Severity
                        </span>
                        <div style={{ marginTop: "2px" }}>
                          <SeverityBadge severity={hotspot.highestSeverity} />
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                          Recent Activity
                        </span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#ea580c" }}>
                          {hotspot.recentActivity}
                        </span>
                      </div>
                    </div>

                    {/* Public Health Evidence Status in Card */}
                    <div
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderRadius: "6px",
                        backgroundColor: hotspot.hasPublicDataContext
                          ? "rgba(22, 163, 74, 0.08)"
                          : "var(--bg-subtle)",
                        border: hotspot.hasPublicDataContext
                          ? "1px solid rgba(22, 163, 74, 0.2)"
                          : "1px solid var(--border-color)",
                        marginBottom: "0.75rem",
                        fontSize: "0.72rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>Public Health Context:</span>
                      <strong style={{ color: hotspot.hasPublicDataContext ? "#15803d" : "var(--text-muted)" }}>
                        {hotspot.hasPublicDataContext
                          ? `✓ ${hotspot.publicHealthEvidence.nearbyFacilityCount} GCC clinic(s) (<1km)`
                          : "None found (<1km)"}
                      </strong>
                    </div>

                    {/* Compact Civic Development Insight Preview in Card */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      <CivicDevelopmentInsightCard hotspot={hotspot} compact={true} />
                    </div>

                    {/* Location Coordinates */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginBottom: "0.75rem"
                      }}
                    >
                      <MapPin size={13} style={{ color: "var(--brand-primary)" }} />
                      <span>
                        Location: <code>{hotspot.centerLat.toFixed(6)}, {hotspot.centerLng.toFixed(6)}</code>
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Zoom / Inspect Trigger */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-color)",
                      paddingTop: "0.75rem",
                      fontSize: "0.75rem"
                    }}
                  >
                    <span style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
                      {isSelected ? "Currently Focused on Map" : "Click to Focus on Map"}
                    </span>
                    <ArrowRight size={13} style={{ color: "var(--brand-primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: "2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)"
            }}
          >
            <MapPinOff size={32} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              No hotspot cluster cards available under current filters.
            </p>
          </div>
        )}
      </div>

      {/* Section 20: Government / Public Data Context */}
      <div
        className="card"
        style={{
          marginTop: "1.75rem",
          padding: "1.5rem",
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "rgba(35, 134, 54, 0.1)",
                color: "#238636"
              }}
            >
              <Building2 size={16} />
            </span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#123B63" }}>
              Public Data Context
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Greater Chennai Corporation (GCC) Public Health Infrastructure
          </span>
        </div>

        {/* 3 Facility Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.85rem",
            marginBottom: "1rem"
          }}
        >
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "6px",
              backgroundColor: "rgba(18, 59, 99, 0.04)",
              border: "1px solid rgba(18, 59, 99, 0.15)"
            }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#123B63", textTransform: "uppercase", display: "block" }}>
              Total Verified Facilities
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#123B63", marginTop: "2px" }}>
              154
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              Health Facilities across 15 GCC Zones
            </span>
          </div>

          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "6px",
              backgroundColor: "rgba(35, 134, 54, 0.05)",
              border: "1px solid rgba(35, 134, 54, 0.2)"
            }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#238636", textTransform: "uppercase", display: "block" }}>
              Primary Healthcare
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#238636", marginTop: "2px" }}>
              140
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              UPHC (Urban Primary Health Centres)
            </span>
          </div>

          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "6px",
              backgroundColor: "rgba(23, 105, 170, 0.05)",
              border: "1px solid rgba(23, 105, 170, 0.2)"
            }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1769AA", textTransform: "uppercase", display: "block" }}>
              Community Healthcare
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1769AA", marginTop: "2px" }}>
              14
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              UCHC (Urban Community Health Centres)
            </span>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.6rem"
          }}
        >
          <Info size={16} style={{ color: "#1769AA", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#17202A", lineHeight: 1.5, fontWeight: 500 }}>
            Public data provides geographic context that can help authorities understand civic issues alongside citizen reports.
          </p>
        </div>

        {/* Source Attribution & Data Ownership Notice */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            backgroundColor: "rgba(18, 59, 99, 0.02)",
            border: "1px solid var(--border-color)",
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5
          }}
        >
          <div style={{ fontWeight: 700, color: "#123B63", marginBottom: "0.2rem" }}>
            Source: Greater Chennai Corporation (GCC) Public Health &amp; Medical Services Department / OpenCity
          </div>
          <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-muted)" }}>
            Public registry data is incorporated solely for spatial context analysis. CivicAI does not own or claim copyright over this official municipal health facility dataset.
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
        }

        .civic-hotspot-leaflet-icon {
          background: transparent;
          border: none;
        }

        .gcc-facility-leaflet-icon {
          background: transparent;
          border: none;
        }

        .leaflet-container {
          font-family: inherit;
          background: #f1f5f9;
          z-index: 1;
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
          .hotspot-grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
