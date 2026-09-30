import React from "react";
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
  Globe
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import SeverityBadge from "../../components/common/SeverityBadge";
import ComplaintTimeline from "../../components/common/ComplaintTimeline";
import EmptyState from "../../components/common/EmptyState";
import { useCivicData } from "../../context/CivicDataContext";
import { getComplaintById } from "../../services/complaintService";
import { Loader2 } from "lucide-react";

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { complaints } = useCivicData();

  const [complaint, setComplaint] = React.useState(() => {
    return complaints.find((c) => c.id === id || c.complaintId === id) || null;
  });
  const [loading, setLoading] = React.useState(!complaint);

  React.useEffect(() => {
    const found = complaints.find((c) => c.id === id || c.complaintId === id);
    if (found) {
      setComplaint(found);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      getComplaintById(id)
        .then((doc) => {
          setComplaint(doc);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching complaint:", err);
          setLoading(false);
        });
    }
  }, [id, complaints]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "10px" }}>
        <Loader2 size={24} className="animate-spin" />
        <span>Loading complaint records...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <EmptyState
        title="Complaint Not Found"
        description="The requested complaint tracking record could not be located."
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
                {complaint.id}
              </span>
              <SeverityBadge severity={complaint.severity} />
              <StatusBadge status={complaint.status} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "2px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                {complaint.district || "Civic Record"}
              </span>
            </div>
            <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>
              {complaint.title || complaint.summary}
            </p>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={14} />
              <span>Submitted on {formattedDate}</span>
            </div>
            <div style={{ marginTop: "2px" }}>
              By <strong>{complaint.submittedBy}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Resolution Progress
        </h3>
        <ComplaintTimeline
          currentStatus={complaint.status}
          timeline={complaint.timeline}
          layout="horizontal"
        />
      </div>

      {/* Main Grid: Details + Map */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.75rem" }} className="complaint-details-grid">
        {/* Left Column: Complaint Details & AI Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                <span>Original Language: <strong>{complaint.language || "English"}</strong></span>
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.5, fontStyle: complaint.language === "Tamil" ? "normal" : "normal" }}>
                "{complaint.originalText || complaint.title}"
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
                      alt="Complaint photo"
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
                <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>
                  CivicAI Classification
                </h4>
              </div>
              <span className="badge badge-ai" style={{ fontSize: "0.7rem" }}>
                <Sparkles size={11} /> AI-powered analysis • Demo
              </span>
            </div>

            <div className="ai-meta-grid" style={{ margin: "0 0 1rem 0" }}>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Category</span>
                <span className="ai-meta-val">{complaint.category}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Subcategory</span>
                <span className="ai-meta-val">{complaint.subcategory}</span>
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
              <p style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.4 }}>
                {complaint.aiAnalysis?.summary || complaint.title}
              </p>
            </div>
          </div>

          {/* Authority Updates Section */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Building2 size={18} color="var(--primary)" />
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                Official Authority Updates ({complaint.authorityUpdates?.length || 0})
              </h4>
            </div>

            {(!complaint.authorityUpdates || complaint.authorityUpdates.length === 0) ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No remarks have been logged yet. The assigned engineering division will post status notes here.
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
                        {upd.officer}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {upd.date}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.4 }}>
                      {upd.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Location & Timeline Audit */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Location & Map Placeholder */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
              <MapPin size={18} color="var(--primary)" />
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                Incident Location
              </h4>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                {complaint.location?.address || "Address: Not available"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                {complaint.location?.ward ? `Ward: ${complaint.location.ward}` : "Ward: Not available"},{" "}
                {complaint.location?.district ? `District: ${complaint.location.district}` : "District: Not available"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--primary)", marginTop: "4px" }}>
                {complaint.location?.captured || (complaint.location?.latitude != null && complaint.location?.longitude != null) ? (
                  <>
                    Lat: {(complaint.location?.latitude ?? complaint.location?.lat)?.toFixed(4)}° N, Lng: {(complaint.location?.longitude ?? complaint.location?.lng)?.toFixed(4)}° E
                    {complaint.location?.accuracy && ` (±${complaint.location.accuracy}m)`}
                  </>
                ) : complaint.location?.lat != null && complaint.location?.lng != null ? (
                  <>
                    Lat: {complaint.location.lat.toFixed(4)}° N, Lng: {complaint.location.lng.toFixed(4)}° E
                  </>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>GPS Coordinates not captured (Optional)</span>
                )}
              </div>
            </div>

            {/* Map Placeholder Graphic */}
            <div
              style={{
                height: "200px",
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
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
              Google Maps integration will be connected in the backend/frontend integration stage.
            </div>
          </div>

          {/* Audit Timeline Logs (Section 13) */}
          <div className="card">
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.85rem", color: "#123B63" }}>
              Official Service Status Timeline
            </h4>
            <ComplaintTimeline
              currentStatus={complaint.status}
              timeline={complaint.timeline}
              layout="vertical"
              submittedDate={formattedDate}
              lastUpdatedDate={
                complaint.updatedAt || complaint.lastUpdated
                  ? new Date(complaint.updatedAt || complaint.lastUpdated).toLocaleString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : formattedDate
              }
              authorityNote={
                complaint.authorityUpdates && complaint.authorityUpdates.length > 0
                  ? complaint.authorityUpdates[complaint.authorityUpdates.length - 1]?.message
                  : complaint.authorityNote || complaint.notes || "Case registered with municipal division."
              }
            />
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
