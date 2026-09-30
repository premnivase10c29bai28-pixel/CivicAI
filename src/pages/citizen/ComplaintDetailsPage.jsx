import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  Navigation,
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import SeverityBadge from "../../components/common/SeverityBadge";
import ComplaintTimeline from "../../components/common/ComplaintTimeline";
import EmptyState from "../../components/common/EmptyState";
import { useCivicData } from "../../context/CivicDataContext";
import {
  subscribeToComplaint,
  getComplaintById,
  formatDisplayStatus
} from "../../services/complaintService";

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { complaints } = useCivicData();

  const [complaint, setComplaint] = useState(() => {
    return complaints.find((c) => c.id === id || c.complaintId === id) || null;
  });
  const [loading, setLoading] = useState(!complaint);

  // Real-time Firestore subscription to complaints/{id}
  useEffect(() => {
    if (!id) return;

    // Fast initial state from context if available
    const initialMatch = complaints.find((c) => c.id === id || c.complaintId === id);
    if (initialMatch && !complaint) {
      setComplaint(initialMatch);
      setLoading(false);
    }

    // Set up live Firestore listener
    const unsubscribe = subscribeToComplaint(id, (liveData) => {
      if (liveData) {
        setComplaint(liveData);
        setLoading(false);
      } else {
        // If snapshot returns null or document not found by doc id, check if ID is complaintId
        const contextFallback = complaints.find((c) => c.id === id || c.complaintId === id);
        if (contextFallback) {
          setComplaint(contextFallback);
        }
        setLoading(false);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [id, complaints]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "10px" }}>
        <Loader2 size={24} className="animate-spin" />
        <span>Loading real-time complaint records...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <EmptyState
        title="Complaint Not Found"
        description="The requested complaint tracking record could not be located in municipal registry."
        actionLabel="Back to Complaints"
        onAction={() => window.location.assign("/citizen/complaints")}
      />
    );
  }

  const formattedDate = new Date(complaint.submittedAt || complaint.createdAt || Date.now()).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Extract latest authority note if available
  const latestAuthorityNote = complaint.authorityNote ||
    complaint.authorityUpdates?.[0]?.message ||
    complaint.authorityUpdates?.[0]?.remarks ||
    complaint.statusHistory?.filter((h) => h.note && h.note !== "Complaint submitted via CivicAI interface. Citizen confirmed AI categorization.")?.slice(-1)[0]?.note ||
    null;

  const latestOfficerName = complaint.authorityUpdates?.[0]?.officer ||
    complaint.statusHistory?.slice(-1)[0]?.officer ||
    "Zonal Municipal Authority";

  const latestUpdateDate = complaint.updatedAt
    ? new Date(complaint.updatedAt.seconds ? complaint.updatedAt.seconds * 1000 : complaint.updatedAt).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : formattedDate;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem", paddingBottom: "3rem" }}>
      {/* Back button & Title */}
      <div>
        <Link
          to="/citizen/complaints"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginBottom: "0.75rem"
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.65rem",
                  fontWeight: 800,
                  color: "var(--primary)"
                }}
              >
                {complaint.id || complaint.complaintId}
              </span>
              <SeverityBadge severity={complaint.severity} />
              <StatusBadge status={complaint.status} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "2px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                {complaint.district || complaint.location?.district || "Chennai South"}
              </span>
            </div>
            <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
              {complaint.title || complaint.summary}
            </p>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={14} />
              <span>Submitted on {formattedDate}</span>
            </div>
            <div style={{ marginTop: "2px" }}>
              By <strong>{complaint.submittedBy || "Citizen"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Progress Stepper */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            Resolution Progress
          </h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Current Status: <strong style={{ color: "var(--primary)" }}>{formatDisplayStatus(complaint.status)}</strong>
          </span>
        </div>
        <ComplaintTimeline
          currentStatus={complaint.status}
          timeline={complaint.timeline}
          layout="horizontal"
        />
      </div>

      {/* Main Grid: Details + Map & Activity History */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.75rem" }} className="complaint-details-grid">
        {/* Left Column: Complaint Details, Latest Note & AI Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Latest Authority Update Section (shown only if an authority note exists) */}
          {latestAuthorityNote && (
            <div
              className="card"
              style={{
                borderLeft: "4px solid var(--primary)",
                backgroundColor: "var(--bg-card)",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Building2 size={18} color="var(--primary)" />
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--primary)" }}>
                    Latest Authority Update
                  </h4>
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  padding: "0.9rem 1.15rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  margin: "0.6rem 0"
                }}
              >
                <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                  "{latestAuthorityNote}"
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>Officer / Wing: <strong>{latestOfficerName}</strong></span>
                <span>Updated: {latestUpdateDate}</span>
              </div>
            </div>
          )}

          {/* Original Complaint Content */}
          <div className="card">
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Original Citizen Report
            </h4>
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "0.75rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <Globe size={13} />
                <span>Original Language: <strong>{complaint.language || complaint.originalLanguage || "English"}</strong></span>
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                "{complaint.originalText || complaint.description || complaint.title}"
              </p>
              {complaint.originalTextEn && complaint.language !== "English" && (
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-main)" }}>English Translation: </strong>
                  {complaint.originalTextEn}
                </div>
              )}
            </div>

            {/* Photos if any */}
            {complaint.images && complaint.images.length > 0 && (
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                  Attached Photographic Evidence
                </span>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {complaint.images.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Complaint evidence"
                      style={{
                        width: "140px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-medium)"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Summary Card */}
          <div className="ai-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={16} color="var(--ai-accent)" />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  CivicAI Classification
                </h4>
              </div>
              <span className="badge badge-ai" style={{ fontSize: "0.7rem" }}>
                <Sparkles size={11} /> AI Decision-Support
              </span>
            </div>

            <div className="ai-meta-grid" style={{ margin: "0 0 1rem 0" }}>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Category</span>
                <span className="ai-meta-val">{complaint.category}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Subcategory</span>
                <span className="ai-meta-val">{complaint.subcategory || "General"}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Department</span>
                <span className="ai-meta-val" style={{ fontSize: "0.85rem" }}>
                  {complaint.department}
                </span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Severity</span>
                <div>
                  <SeverityBadge severity={complaint.severity} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-card)", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                Structured Problem Summary
              </span>
              <p style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.4, margin: 0 }}>
                {complaint.summary || complaint.aiAnalysis?.summary || complaint.title}
              </p>
            </div>
          </div>

          {/* All Official Authority Updates List */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Building2 size={18} color="var(--primary)" />
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                Authority Update Logs ({complaint.authorityUpdates?.length || 0})
              </h4>
            </div>

            {(!complaint.authorityUpdates || complaint.authorityUpdates.length === 0) ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                No separate remarks have been logged yet. The assigned engineering division will post status notes here.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {complaint.authorityUpdates.map((upd) => (
                  <div
                    key={upd.id}
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary)" }}>
                        {upd.officer || upd.author || "Authority"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {upd.date || (upd.timestamp ? new Date(upd.timestamp).toLocaleDateString() : "")}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.4, margin: 0 }}>
                      {upd.message || upd.remarks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Location & Status History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Incident Location */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
              <MapPin size={18} color="var(--primary)" />
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                Incident Location
              </h4>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                {complaint.location?.address || "Reported Location, Ward 12"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                {complaint.location?.ward || "Ward 12"}, {complaint.location?.district || complaint.district || "Chennai South"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--primary)", marginTop: "4px" }}>
                Lat: {(complaint.location?.lat || complaint.latitude || 13.0067).toFixed(4)}° N, Lng: {(complaint.location?.lng || complaint.longitude || 80.2571).toFixed(4)}° E
              </div>
            </div>

            {/* Map Placeholder Graphic */}
            <div
              style={{
                height: "180px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-medium)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div className="map-grid-overlay" />
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.25)",
                  zIndex: 2
                }}
              >
                <MapPin size={20} />
              </div>
              <span style={{ zIndex: 2, marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Interactive GIS Location Pin
              </span>
            </div>
          </div>

          {/* Status History / Complaint Activity Audit */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} color="var(--primary)" />
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                  Complaint Activity
                </h4>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
                Current: {formatDisplayStatus(complaint.status)}
              </span>
            </div>

            {/* Render Chronological Status History if available, or fallback to timeline */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", position: "relative" }}>
                {complaint.statusHistory.map((item, idx) => {
                  const isCurrent = idx === complaint.statusHistory.length - 1;
                  const itemDate = item.timestamp
                    ? new Date(item.timestamp.seconds ? item.timestamp.seconds * 1000 : item.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Recently";

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        position: "relative"
                      }}
                    >
                      {/* Checkmark or Clock Indicator */}
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          backgroundColor: isCurrent ? "var(--primary)" : "rgba(34, 197, 94, 0.15)",
                          color: isCurrent ? "#ffffff" : "#16a34a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px"
                        }}
                      >
                        {isCurrent ? <Clock size={13} strokeWidth={2.5} /> : <CheckCircle2 size={15} />}
                      </div>

                      {/* History Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: isCurrent ? 700 : 600, color: isCurrent ? "var(--primary)" : "var(--text-main)" }}>
                            {formatDisplayStatus(item.status)}
                            {isCurrent && " (Active)"}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {itemDate}
                          </span>
                        </div>
                        {item.note && (
                          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "2px 0 0 0", lineHeight: 1.35 }}>
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ComplaintTimeline
                currentStatus={complaint.status}
                timeline={complaint.timeline}
                layout="vertical"
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .complaint-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
