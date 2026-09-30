import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Save,
  Loader2,
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  XCircle,
  MapPin,
  Camera,
  UserCheck
} from "lucide-react";
import FilterPanel from "../../components/common/FilterPanel";
import SearchBar from "../../components/common/SearchBar";
import ComplaintTable from "../../components/common/ComplaintTable";
import StatusBadge from "../../components/common/StatusBadge";
import SeverityBadge from "../../components/common/SeverityBadge";
import ComplaintTimeline from "../../components/common/ComplaintTimeline";
import Modal from "../../components/common/Modal";
import { useCivicData } from "../../context/CivicDataContext";

export const AUTHORITY_STATUSES = [
  "REPORTED",
  "RECEIVED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED"
];

export default function AuthorityComplaintsPage() {
  const [searchParams] = useSearchParams();
  const { complaints, updateComplaintStatus, currentUser } = useCivicData();

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "All",
    severity: "All",
    status: "All",
    department: "All",
    district: "All"
  });

  // Selected complaint for Detail Inspection Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("UNDER_REVIEW");
  const [statusRemark, setStatusRemark] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle URL query param `?id=CIV-...`
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      const match = complaints.find((c) => c.id === idParam || c.complaintId === idParam);
      if (match) {
        setSelectedComplaint(match);
        setNewStatus(match.status || "UNDER_REVIEW");
      }
    }
  }, [searchParams, complaints]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "All",
      severity: "All",
      status: "All",
      department: "All",
      district: "All"
    });
    setSearchTerm("");
  };

  const norm = (s) => (s || "").toString().toUpperCase().replace(/\s+/g, "_");

  // Filter complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Category filter
      if (filters.category !== "All" && item.category !== filters.category) return false;
      // Severity filter
      if (filters.severity !== "All" && (item.severity || "").toUpperCase() !== filters.severity.toUpperCase()) return false;
      // Status filter
      if (filters.status !== "All" && norm(item.status) !== norm(filters.status)) return false;
      // Department filter
      if (filters.department !== "All" && item.department !== filters.department) return false;
      // District filter
      if (filters.district !== "All" && (item.location?.district || item.district) !== filters.district) return false;

      // Search term: ID, category, or location
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = (item.id || item.complaintId || "").toLowerCase().includes(q);
        const matchesCat = (item.category || "").toLowerCase().includes(q);
        const addr = item.location?.address || "";
        const ward = item.location?.ward || "";
        const matchesLoc = addr.toLowerCase().includes(q) || ward.toLowerCase().includes(q);
        const matchesText =
          (item.title || "").toLowerCase().includes(q) ||
          (item.summary || "").toLowerCase().includes(q) ||
          (item.originalText || item.description || "").toLowerCase().includes(q);
        if (!matchesId && !matchesCat && !matchesLoc && !matchesText) return false;
      }

      return true;
    });
  }, [complaints, filters, searchTerm]);

  // Open manage modal
  const handleOpenManage = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || "UNDER_REVIEW");
    setStatusRemark("");
  };

  // Update status handler
  const handleSaveStatus = async (e) => {
    if (e) e.preventDefault();
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      await updateComplaintStatus(
        selectedComplaint.id || selectedComplaint.complaintId,
        newStatus,
        statusRemark || `Status progressed to ${newStatus} by ${currentUser.name}`,
        currentUser.name
      );

      // Update local modal state
      setSelectedComplaint((prev) => ({
        ...prev,
        status: newStatus
      }));
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Action Buttons
  const handleQuickStatus = (statusName) => {
    setNewStatus(statusName);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "3rem" }}>
      {/* Page Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Building2 size={20} color="var(--primary)" />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)" }}>
              Authority Complaint Management
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Triage, assign, inspect, and update status of civic complaints across municipal divisions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              padding: "0.4rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              color: "var(--primary-navy, #123B63)"
            }}
          >
            {filteredComplaints.length} Complaints Displayed
          </span>
        </div>
      </div>

      {/* Search Bar - Exactly "Search by complaint ID, category or location" */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search by complaint ID, category or location"
        />
      </div>

      {/* Filter Panel: Category, Severity, Status, Date, Location */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        showDepartment={true}
        showDistrict={true}
      />

      {/* Complaints Table */}
      <ComplaintTable
        complaints={filteredComplaints}
        isAuthority={true}
        onActionClick={handleOpenManage}
      />

      {/* Professional Inspection Modal (Left: Citizen details, Right: Status & Actions) */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Inspection Docket: ${selectedComplaint.id}`}
          subtitle={`${selectedComplaint.category} • ${selectedComplaint.location?.ward || "Ward 12"}`}
          maxWidth="840px"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem" }} className="inspection-modal-grid">
            {/* Left Column: Citizen complaint, Description, Photo, Location, AI Analysis */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Description */}
              <div style={{ backgroundColor: "var(--bg-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Citizen Description ({selectedComplaint.language || "English"})
                </span>
                <p style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.4, margin: 0 }}>
                  "{selectedComplaint.originalText || selectedComplaint.title || selectedComplaint.description}"
                </p>
                {selectedComplaint.originalTextEn && selectedComplaint.language !== "English" && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "6px", fontStyle: "italic" }}>
                    Translation: {selectedComplaint.originalTextEn}
                  </p>
                )}
              </div>

              {/* Photo Evidence if attached */}
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Photo Evidence
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {selectedComplaint.images.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt="Evidence"
                        style={{ width: "100px", height: "75px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-medium)" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div style={{ backgroundColor: "var(--bg-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  <MapPin size={13} color="var(--primary)" />
                  <span>Incident Location</span>
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>
                  {selectedComplaint.location?.address || "Address not provided"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {selectedComplaint.location?.ward || "Ward 12"}, {selectedComplaint.location?.district || "Chennai South"}
                </div>
              </div>

              {/* AI Analysis Summary */}
              <div style={{ backgroundColor: "var(--bg-card)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-blue, #1769AA)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  CivicAI Analysis
                </span>
                <div style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.4 }}>
                  {selectedComplaint.aiAnalysis?.summary || selectedComplaint.summary || selectedComplaint.title}
                </div>
              </div>
            </div>

            {/* Right Column: Status, Department, Priority, Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Current Status & Priority */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Status</span>
                  <StatusBadge status={selectedComplaint.status} size="sm" />
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Priority</span>
                  <SeverityBadge severity={selectedComplaint.severity} />
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Department</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{selectedComplaint.department}</span>
                </div>
              </div>

              {/* Authority Quick Actions */}
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Authority Actions
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  <button
                    type="button"
                    onClick={() => handleQuickStatus("UNDER_REVIEW")}
                    className={`btn btn-sm ${newStatus === "UNDER_REVIEW" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  >
                    Move to Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatus("ASSIGNED")}
                    className={`btn btn-sm ${newStatus === "ASSIGNED" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatus("IN_PROGRESS")}
                    className={`btn btn-sm ${newStatus === "IN_PROGRESS" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  >
                    Start Work
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatus("RESOLVED")}
                    className={`btn btn-sm ${newStatus === "RESOLVED" ? "btn-success" : "btn-secondary"}`}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatus("REJECTED")}
                    className={`btn btn-sm ${newStatus === "REJECTED" ? "btn-danger" : "btn-secondary"}`}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleSaveStatus} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    Selected Stage: <strong style={{ color: "var(--primary)" }}>{newStatus}</strong>
                  </label>
                  <textarea
                    className="textarea-field"
                    rows={3}
                    style={{ fontSize: "0.85rem", padding: "0.6rem" }}
                    placeholder="Add official authority note (e.g. Field team dispatched under Junior Engineer...)"
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isUpdating}
                    style={{ backgroundColor: "var(--primary-navy, #123B63)", fontWeight: 700 }}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Updating Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Commit Status Update</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Timeline preview */}
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Resolution Timeline
                </span>
                <ComplaintTimeline currentStatus={selectedComplaint.status} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @media (max-width: 768px) {
          .inspection-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
