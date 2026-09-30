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
  Clock
} from "lucide-react";
import VoiceRecorderUI from "../../components/common/VoiceRecorderUI";
import ImageUploader from "../../components/common/ImageUploader";
import LocationCard from "../../components/common/LocationCard";
import AIAnalysisCard from "../../components/common/AIAnalysisCard";
import ComplaintTimeline from "../../components/common/ComplaintTimeline";
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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [location, setLocation] = useState({
    address: "Cross Street 4, Kasturba Nagar, Adyar",
    ward: "Ward 12",
    district: "Chennai South",
    lat: 13.0067,
    lng: 80.2571
  });

  // AI Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isConfirmedByCitizen, setIsConfirmedByCitizen] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Apply a sample preset for swift demo testing
  const handleApplyPreset = (preset) => {
    setComplaintText(preset.text);
    setLocation({
      ...location,
      address: preset.location,
      ward: preset.location.includes("Ward 8") ? "Ward 8" : preset.location.includes("Ward 21") ? "Ward 21" : "Ward 12"
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
        // Asynchronous AI analyzer
        analysis = await analyzeComplaint(text);
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
    showToast("AI interpretation confirmed! Ready to submit.", "success");
  };

  // Final submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!aiResult || !isConfirmedByCitizen) {
      showToast("Please confirm the AI interpretation before submitting", "error");
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
        location: location,
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

  // =========================================================================
  // SCREEN 6: SUBMISSION SUCCESS VIEW
  // =========================================================================
  if (submittedComplaint) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 0" }}>
        <div
          className="card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)"
          }}
        >
          {/* Success Check Icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "rgba(5, 150, 105, 0.12)",
              color: "#059669",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}
          >
            <CheckCircle2 size={42} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Complaint Submitted Successfully
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
            Your civic complaint has been registered, auto-triaged, and queued with the relevant department.
          </p>

          {/* Complaint ID Card */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-medium)",
              padding: "1rem 2rem",
              borderRadius: "var(--radius-lg)",
              marginBottom: "2rem"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
              Permanent Complaint Tracking ID
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--primary)",
                letterSpacing: "0.05em"
              }}
            >
              {submittedComplaint.id}
            </span>
            <div style={{ marginTop: "4px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Current Status: <strong style={{ color: "var(--primary)" }}>Reported</strong>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ textAlign: "left", marginBottom: "2.5rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Resolution Progress Workflow:
            </h4>
            <ComplaintTimeline currentStatus="Reported" />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to={`/citizen/complaints/${submittedComplaint.id}`}
              className="btn btn-primary btn-lg"
            >
              <span>Track Complaint</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/citizen" className="btn btn-secondary btn-lg">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 4: REPORT PROBLEM INTERFACE
  // =========================================================================
  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Report a Civic Problem
        </h1>
        <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)" }}>
          Tell us what is happening. CivicAI will understand, categorize, and organize your complaint.
        </p>
      </div>

      {/* Demo Presets Row */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-card)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.6rem" }}>
          <Sparkles size={15} color="var(--primary)" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.04em" }}>
            Hackathon Demo Presets (Instant Load):
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {MOCK_SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleApplyPreset(p)}
              style={{ fontSize: "0.78rem" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Method Switcher Tabs */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "1rem",
              marginBottom: "1.25rem"
            }}
          >
            <button
              type="button"
              className={`btn ${activeTab === "text" ? "btn-primary" : "btn-ghost"} btn-sm`}
              onClick={() => setActiveTab("text")}
            >
              <FileText size={15} />
              <span>Text Input</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "voice" ? "btn-primary" : "btn-ghost"} btn-sm`}
              onClick={() => setActiveTab("voice")}
            >
              <Mic size={15} />
              <span>Voice Recording</span>
            </button>
          </div>

          {/* A. Text Input */}
          {activeTab === "text" && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Problem Description</span>
                <span className="text-xs text-muted">Type in Tamil or English</span>
              </label>
              <textarea
                className="textarea-field"
                rows={4}
                style={{ fontSize: "1rem", lineHeight: 1.5 }}
                placeholder="Describe the problem in your own words... (e.g., எங்கள் பகுதியில் ஐந்து நாட்களாக குடிநீர் வரவில்லை...)"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />
            </div>
          )}

          {/* B. Voice Input */}
          {activeTab === "voice" && (
            <VoiceRecorderUI
              preferredLanguage={currentUser.preferredLanguage || "Tamil"}
              onTranscriptionComplete={(text, lang) => {
                setComplaintText(text);
                runAIAnalysis(text);
              }}
            />
          )}

          {/* Trigger AI Analysis button */}
          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={!complaintText.trim() || isAnalyzing}
              onClick={() => runAIAnalysis(complaintText)}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles size={14} className="animate-spin" />
                  Analyzing with CivicAI...
                </>
              ) : (
                <>
                  <Sparkles size={14} color="var(--primary)" />
                  Analyze with CivicAI
                </>
              )}
            </button>
          </div>
        </div>

        {/* C. Image Upload */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
            <Camera size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Attach Photo Evidence (Optional)
            </h3>
          </div>
          <ImageUploader
            images={uploadedImages}
            onImagesChange={(imgs) => setUploadedImages(imgs)}
          />
        </div>

        {/* D. Location Card */}
        <LocationCard
          location={location}
          onLocationChange={(newLoc) => setLocation(newLoc)}
        />

        {/* =========================================================================
            SCREEN 5: AI ANALYSIS RESULT (CONFIRM / EDIT)
            ========================================================================= */}
        {aiResult && (
          <AIAnalysisCard
            analysis={aiResult}
            isConfirmed={isConfirmedByCitizen}
            onConfirm={handleConfirmAI}
            onEditChange={(updated) => {
              setAiResult(updated);
              setIsConfirmedByCitizen(false);
            }}
          />
        )}

        {/* Final Submission Action Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            backgroundColor: "var(--bg-card)",
            padding: "1.25rem 1.75rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-card)"
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              Submission Gate:{" "}
              {isConfirmedByCitizen ? (
                <span style={{ color: "#059669" }}>✓ Interpretation Confirmed</span>
              ) : (
                <span style={{ color: "#ea580c" }}>Confirmation Required</span>
              )}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              CivicAI ensures citizen verification prior to official routing.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isConfirmedByCitizen || isSubmitting}
            className="btn btn-primary btn-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Submitting to CivicAI...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Verified Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
