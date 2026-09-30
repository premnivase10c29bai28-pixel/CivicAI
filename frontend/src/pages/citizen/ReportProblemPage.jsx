import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  FileText,
  Mic,
  Camera,
  MapPin,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Check,
  Building2,
  Info
} from "lucide-react";
import VoiceRecorderUI from "../../components/common/VoiceRecorderUI";
import ImageUploader from "../../components/common/ImageUploader";
import LocationCard from "../../components/common/LocationCard";
import AIAnalysisCard from "../../components/common/AIAnalysisCard";
import ComplaintTimeline from "../../components/common/ComplaintTimeline";
import SeverityBadge from "../../components/common/SeverityBadge";
import { useCivicData } from "../../context/CivicDataContext";
import { MOCK_SAMPLE_PRESETS } from "../../data/mockData";
import { analyzeComplaint } from "../../services/aiService";
import { Loader2 } from "lucide-react";

export default function ReportProblemPage() {
  const navigate = useNavigate();
  const { addComplaint, showToast, currentUser } = useCivicData();

  // Form State
  const [activeTab, setActiveTab] = useState("text"); // 'text' | 'voice'
  const [complaintText, setComplaintText] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState(currentUser?.preferredLanguage || "Tamil");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [location, setLocation] = useState({
    address: "",
    ward: "",
    district: "",
    latitude: null,
    longitude: null,
    captured: false
  });

  // AI Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isConfirmedByCitizen, setIsConfirmedByCitizen] = useState(false);
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Apply a sample preset for swift demo testing
  const handleApplyPreset = (preset) => {
    setComplaintText(preset.text);
    setLocation({
      address: preset.location,
      ward: preset.location.includes("Ward 8") ? "Ward 8" : preset.location.includes("Ward 21") ? "Ward 21" : "Ward 12",
      district: "Chennai South",
      latitude: 13.0067,
      longitude: 80.2571,
      lat: 13.0067,
      lng: 80.2571,
      captured: true
    });
    // Trigger AI analysis with preset data
    runAIAnalysis(preset.text, preset);
  };

  // Run AI analysis
  const runAIAnalysis = async (textToAnalyze, presetData = null) => {
    const text = textToAnalyze || complaintText;
    if (!text.trim()) {
      showToast("Please provide complaint details or speak via voice first", "error");
      return;
    }

    setIsAnalyzing(true);
    setIsConfirmedByCitizen(false);

    try {
      let analysis;
      if (presetData) {
        analysis = {
          category: presetData.category,
          subcategory: presetData.subcategory,
          severity: presetData.severity,
          department: presetData.department,
          language: presetData.language,
          summary: presetData.summary,
          confidence: 0.96
        };
      } else {
        analysis = await analyzeComplaint(text, voiceLanguage);
      }

      setAiResult(analysis);
      showToast("CivicAI analyzed your complaint. Please verify interpretation.", "info");
    } catch (err) {
      console.error("AI Analysis error:", err);
      showToast("Analysis encountered an error. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Citizen confirms AI interpretation
  const handleConfirmAI = (confirmedData) => {
    setAiResult(confirmedData);
    setIsConfirmedByCitizen(true);
    showToast("AI interpretation confirmed! Proceed to location and review.", "success");
  };

  // Final submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!aiResult || !isConfirmedByCitizen) {
      showToast("Please confirm the AI interpretation before submitting", "error");
      return;
    }
    if (!accuracyConfirmed) {
      showToast("Please check the accuracy declaration before submitting", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const newComp = await addComplaint({
        description: complaintText,
        text: complaintText,
        textEn: aiResult.summary,
        summary: aiResult.summary,
        title: aiResult.summary,
        category: aiResult.category,
        subcategory: aiResult.subcategory,
        severity: (aiResult.severity || "MEDIUM").toUpperCase(),
        department: aiResult.department,
        originalLanguage: aiResult.language || "English",
        language: aiResult.language || "English",
        location: location
          ? {
              latitude:
                location.latitude !== null && location.latitude !== undefined
                  ? Number(location.latitude)
                  : null,
              longitude:
                location.longitude !== null && location.longitude !== undefined
                  ? Number(location.longitude)
                  : null,
              lat:
                location.latitude !== null && location.latitude !== undefined
                  ? Number(location.latitude)
                  : (location.lat ? Number(location.lat) : 13.0067),
              lng:
                location.longitude !== null && location.longitude !== undefined
                  ? Number(location.longitude)
                  : (location.lng ? Number(location.lng) : 80.2571),
              address: location.address || (location.captured ? "Address recorded" : "Address: Not provided"),
              city: location.city || "",
              district: location.district || "Chennai South",
              state: location.state || "Tamil Nadu",
              ward: location.ward || currentUser.ward || "Ward 12",
              accuracy: location.accuracy || null,
              captured: Boolean(location.captured || (location.latitude !== null && location.longitude !== null))
            }
          : null,
        imageUrl: uploadedImages.length > 0 ? uploadedImages[0] : null,
        images: uploadedImages,
        aiAnalysis: aiResult
      });

      setSubmittedComplaint(newComp);
    } catch (err) {
      console.error("Submission failed:", err);
      showToast("Submission failed. Please check network connectivity.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine current wizard step for visual stepper
  const hasText = complaintText.trim().length > 0;
  const hasAnalysis = Boolean(aiResult);
  const hasLocation = Boolean(location?.captured || (location?.latitude && location?.longitude));

  // =========================================================================
  // SUBMISSION SUCCESS VIEW
  // =========================================================================
  if (submittedComplaint) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 0" }}>
        <div
          className="card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-medium)"
          }}
        >
          {/* Success Check Icon */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              backgroundColor: "rgba(35, 134, 54, 0.12)",
              color: "var(--success-green, #238636)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}
          >
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
            ✓ Complaint Submitted Successfully
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "1.75rem", maxWidth: "600px", margin: "0 auto 1.75rem" }}>
            Your complaint has been successfully registered. You can track its progress from My Complaints.
          </p>

          {/* Official Complaint Summary Ticket */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-medium)",
              padding: "1.25rem 2.25rem",
              borderRadius: "var(--radius-lg)",
              marginBottom: "2rem",
              textAlign: "center"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", display: "block" }}>
              Permanent Grievance Tracking ID
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--primary-navy, #123B63)",
                letterSpacing: "0.05em",
                display: "block",
                margin: "4px 0"
              }}
            >
              {submittedComplaint.id || submittedComplaint.complaintId}
            </span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.85rem", marginTop: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Current Status:</span>
              <strong style={{ color: "var(--primary-blue, #1769AA)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                REPORTED
              </strong>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div style={{ textAlign: "left", marginBottom: "2.25rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-main)" }}>
              Official Resolution Timeline:
            </h4>
            <ComplaintTimeline currentStatus="Reported" />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to={`/citizen/complaints/${submittedComplaint.id}`}
              className="btn btn-primary"
              style={{ padding: "0.75rem 1.5rem", fontWeight: 700, backgroundColor: "var(--primary-navy, #123B63)" }}
            >
              <span>Track Complaint</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/citizen" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem", fontWeight: 600 }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN 5-STEP CITIZEN REPORT INTERFACE
  // =========================================================================
  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Page Title & Scope */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)" }}>
            Report a Civic Problem
          </h1>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          Official citizen grievance redressal system. Describe your issue in Tamil or English to begin AI classification.
        </p>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="gov-step-indicator">
        <div className={`gov-step-item ${hasText ? "completed" : "active"}`}>
          <div className="gov-step-number">{hasText ? <Check size={14} /> : 1}</div>
          <span>STEP 1: Describe</span>
        </div>

        <div className="gov-step-divider" />

        <div className={`gov-step-item ${isConfirmedByCitizen ? "completed" : hasAnalysis ? "active" : ""}`}>
          <div className="gov-step-number">{isConfirmedByCitizen ? <Check size={14} /> : 2}</div>
          <span>STEP 2: AI Analysis</span>
        </div>

        <div className="gov-step-divider" />

        <div className={`gov-step-item ${hasLocation ? "completed" : isConfirmedByCitizen ? "active" : ""}`}>
          <div className="gov-step-number">{hasLocation ? <Check size={14} /> : 3}</div>
          <span>STEP 3: Location</span>
        </div>

        <div className="gov-step-divider" />

        <div className={`gov-step-item ${uploadedImages.length > 0 ? "completed" : ""}`}>
          <div className="gov-step-number">{uploadedImages.length > 0 ? <Check size={14} /> : 4}</div>
          <span>STEP 4: Photo (Optional)</span>
        </div>

        <div className="gov-step-divider" />

        <div className={`gov-step-item ${isConfirmedByCitizen && accuracyConfirmed ? "completed" : ""}`}>
          <div className="gov-step-number">5</div>
          <span>STEP 5: Review & Submit</span>
        </div>
      </div>

      {/* Demo Quick Select Presets Row */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "0.85rem 1.25rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
          <Sparkles size={14} color="var(--primary)" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.05em" }}>
            Quick Demo Presets:
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {MOCK_SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleApplyPreset(p)}
              style={{ fontSize: "0.75rem" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* =========================================================================
            STEP 1: DESCRIBE THE PROBLEM
            ========================================================================= */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
                STEP 1 OF 5
              </span>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                Describe your civic problem
              </h2>
            </div>

            {/* Language Options */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Language:</span>
              <button
                type="button"
                className={`btn btn-sm ${voiceLanguage === "Tamil" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                onClick={() => setVoiceLanguage("Tamil")}
              >
                தமிழ்
              </button>
              <button
                type="button"
                className={`btn btn-sm ${voiceLanguage === "English" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                onClick={() => setVoiceLanguage("English")}
              >
                English
              </button>
            </div>
          </div>

          {/* Mode Switcher: Text vs Voice */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "0.75rem",
              marginBottom: "1rem"
            }}
          >
            <button
              type="button"
              className={`btn ${activeTab === "text" ? "btn-primary" : "btn-ghost"} btn-sm`}
              onClick={() => setActiveTab("text")}
            >
              <FileText size={15} />
              <span>Type Complaint</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "voice" ? "btn-primary" : "btn-ghost"} btn-sm`}
              onClick={() => setActiveTab("voice")}
            >
              <Mic size={15} />
              <span>🎤 Speak your complaint</span>
            </button>
          </div>

          {/* Text Area Input */}
          {activeTab === "text" && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <textarea
                className="textarea-field"
                rows={4}
                style={{ fontSize: "1rem", lineHeight: 1.5, padding: "0.85rem" }}
                placeholder="Example: There has been no drinking water supply in our street for five days."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />
            </div>
          )}

          {/* Voice Input UI */}
          {activeTab === "voice" && (
            <div>
              <VoiceRecorderUI
                preferredLanguage={voiceLanguage}
                complaintText={complaintText}
                onLanguageChange={(lang) => setVoiceLanguage(lang)}
                onTranscriptionChange={(text) => setComplaintText(text)}
              />

              <div className="form-group" style={{ marginTop: "1rem", marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "0.825rem", fontWeight: 600 }}>
                  Transcribed Details (Editable):
                </label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  style={{ fontSize: "0.95rem" }}
                  placeholder="Transcribed voice will appear here. Edit or add details before analyzing..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Trigger AI Analysis Button */}
          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {complaintText.trim()
                ? `${complaintText.trim().length} characters recorded`
                : "Enter complaint details or speak via voice"}
            </span>

            <button
              type="button"
              className="btn btn-primary"
              disabled={!complaintText.trim() || isAnalyzing}
              onClick={() => runAIAnalysis(complaintText)}
              style={{ fontWeight: 600, padding: "0.6rem 1.25rem", backgroundColor: "var(--primary-navy, #123B63)" }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing with CivicAI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} color="#E88A1A" />
                  <span>Analyze with CivicAI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: CIVICAI ANALYSIS RESULT
            ========================================================================= */}
        {aiResult && (
          <div>
            <div style={{ marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                STEP 2 OF 5: AI CLASSIFICATION
              </span>
            </div>
            <AIAnalysisCard
              analysis={aiResult}
              isConfirmed={isConfirmedByCitizen}
              onConfirm={handleConfirmAI}
              onEditChange={(updated) => {
                setAiResult(updated);
                setIsConfirmedByCitizen(false);
              }}
            />
          </div>
        )}

        {/* =========================================================================
            STEP 3: INCIDENT LOCATION
            ========================================================================= */}
        <div>
          <div style={{ marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              STEP 3 OF 5: LOCATION
            </span>
          </div>
          <LocationCard
            location={location}
            onLocationChange={(newLoc) => setLocation(newLoc)}
          />
        </div>

        {/* =========================================================================
            STEP 4: PHOTO EVIDENCE (OPTIONAL)
            ========================================================================= */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.4rem" }}>
            <Camera size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Photo Evidence (Optional)
            </h3>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Add a photograph to help authorities understand the issue.
          </p>
          <ImageUploader
            images={uploadedImages}
            onImagesChange={(imgs) => setUploadedImages(imgs)}
          />
        </div>

        {/* =========================================================================
            STEP 5: REVIEW & FINAL SUBMISSION
            ========================================================================= */}
        <div
          className="card"
          style={{
            border: "1px solid var(--border-medium)",
            backgroundColor: "var(--bg-card)",
            padding: "1.5rem"
          }}
        >
          <div style={{ borderBottom: "2px solid var(--primary-navy, #123B63)", paddingBottom: "0.6rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              STEP 5 OF 5: FINAL VERIFICATION
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", margin: "2px 0 0 0" }}>
              Review & Submit Complaint
            </h3>
          </div>

          {/* Pre-submission Review Table */}
          <div
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              padding: "1rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.85rem",
              marginBottom: "1.25rem",
              fontSize: "0.85rem"
            }}
          >
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Category</span>
              <strong style={{ color: "var(--text-main)" }}>{aiResult?.category || "Awaiting AI Analysis"}</strong>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Severity</span>
              {aiResult ? <SeverityBadge severity={aiResult.severity} /> : <span style={{ color: "var(--text-muted)" }}>--</span>}
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Responsible Department</span>
              <strong style={{ color: "var(--text-main)" }}>{aiResult?.department || "Awaiting Analysis"}</strong>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Location</span>
              <strong style={{ color: "var(--text-main)" }}>
                {location.ward || location.address || (location.captured ? "Coordinates Captured" : "Ward 12 (Default)")}
              </strong>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Complaint Summary</span>
              <p style={{ margin: "2px 0 0 0", color: "var(--text-main)", lineHeight: 1.4 }}>
                {aiResult?.summary || complaintText || "Please enter complaint text above."}
              </p>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Photo Evidence</span>
              <span style={{ color: uploadedImages.length > 0 ? "var(--success-green, #238636)" : "var(--text-muted)", fontWeight: 600 }}>
                {uploadedImages.length > 0 ? "✓ 1 photo attached locally (demo mode)" : "No photo attached (Optional)"}
              </span>
            </div>
          </div>

          {/* Citizen Confirmation Checkbox */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(18, 59, 99, 0.04)",
              border: "1px solid var(--border-medium)",
              marginBottom: "1.25rem"
            }}
          >
            <input
              type="checkbox"
              id="confirm-accuracy-checkbox"
              checked={accuracyConfirmed}
              onChange={(e) => setAccuracyConfirmed(e.target.checked)}
              style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer" }}
            />
            <label htmlFor="confirm-accuracy-checkbox" style={{ fontSize: "0.85rem", color: "var(--text-main)", cursor: "pointer", fontWeight: 600, lineHeight: 1.4 }}>
              I confirm that the information provided is accurate to the best of my knowledge.
            </label>
          </div>

          {/* Submit Action Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {!isConfirmedByCitizen ? (
                <span style={{ color: "#B7791F" }}>⚠️ Please confirm AI interpretation in Step 2 first</span>
              ) : !accuracyConfirmed ? (
                <span style={{ color: "#B7791F" }}>⚠️ Please check the accuracy declaration above</span>
              ) : (
                <span style={{ color: "var(--success-green, #238636)", fontWeight: 600 }}>✓ Ready for official submission</span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isConfirmedByCitizen || !accuracyConfirmed || isSubmitting}
              className="btn btn-primary btn-lg"
              style={{
                backgroundColor: "var(--primary-navy, #123B63)",
                fontWeight: 700,
                padding: "0.85rem 2rem"
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting Complaint...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
