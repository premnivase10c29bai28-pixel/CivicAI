import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  AlertCircle,
  RotateCcw,
  Globe,
  MicOff
} from "lucide-react";

const VOICE_LANGUAGES = [
  { code: "ta-IN", label: "தமிழ் (Tamil)", name: "Tamil", flag: "🇮🇳" },
  { code: "en-IN", label: "English (India)", name: "English (India)", flag: "🇮🇳" },
  { code: "en-US", label: "English (US)", name: "English (US)", flag: "🇺🇸" }
];

export default function VoiceRecorderUI({
  onTranscriptionChange,
  onTranscriptionComplete,
  complaintText = "",
  preferredLanguage = "Tamil",
  onLanguageChange
}) {
  const initialLangCode =
    preferredLanguage && preferredLanguage.toLowerCase().includes("tam")
      ? "ta-IN"
      : "en-IN";

  const [selectedLangCode, setSelectedLangCode] = useState(initialLangCode);
  const [micState, setMicState] = useState(() => {
    if (typeof window === "undefined") return "idle";
    const hasSpeech = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    return hasSpeech ? "idle" : "unsupported";
  });
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const baseTextRef = useRef("");

  // Helper for language name
  const getLanguageName = (code) => {
    const found = VOICE_LANGUAGES.find((l) => l.code === code);
    return found ? found.name : "English";
  };

  // Timer interval effect while listening
  useEffect(() => {
    if (micState === "listening") {
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [micState]);

  // Clean up recognition instance on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start speech recognition
  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicState("unsupported");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore abort
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLangCode;
      recognition.maxAlternatives = 1;

      baseTextRef.current = complaintText ? complaintText.trim() : "";
      setLiveTranscript("");
      setErrorMessage("");
      setRecordSeconds(0);

      recognition.onstart = () => {
        setMicState("listening");
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const sessionSpoken = (finalTranscript + interimTranscript).trim();
        setLiveTranscript(sessionSpoken);

        // Append to base text so user can build up multiple phrases
        const base = baseTextRef.current;
        const fullText = base
          ? (sessionSpoken ? `${base} ${sessionSpoken}` : base)
          : sessionSpoken;

        if (onTranscriptionChange) {
          onTranscriptionChange(fullText);
        }
        if (onTranscriptionComplete) {
          onTranscriptionComplete(fullText, getLanguageName(selectedLangCode));
        }
      };

      recognition.onerror = (event) => {
        console.warn("[VoiceRecorderUI] Speech recognition event error:", event.error);
        if (event.error === "aborted") {
          return;
        }

        setMicState("error");

        const langName = VOICE_LANGUAGES.find((l) => l.code === selectedLangCode)?.label || selectedLangCode;
        switch (event.error) {
          case "not-allowed":
            setErrorMessage("Microphone access was denied. Please allow microphone permission in your browser address bar.");
            break;
          case "no-speech":
            setErrorMessage("No speech was detected. Please check your microphone and speak clearly.");
            break;
          case "audio-capture":
            setErrorMessage("No microphone detected. Please connect an audio input device and reload.");
            break;
          case "network":
            setErrorMessage("Network error during speech recognition. Please verify your internet connection.");
            break;
          case "language-not-supported":
            setErrorMessage(`Speech recognition for ${langName} is not supported in this browser environment.`);
            break;
          default:
            setErrorMessage(`Microphone error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        setMicState((prev) => (prev === "listening" ? "idle" : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("[VoiceRecorderUI] Start error:", err);
      setMicState("error");
      setErrorMessage(err.message || "Failed to start speech recognition.");
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setMicState("idle");
  };

  // Handle language switch
  const handleLanguageChange = (langCode) => {
    if (micState === "listening") {
      stopListening();
    }
    setSelectedLangCode(langCode);
    setErrorMessage("");
    if (onLanguageChange) {
      onLanguageChange(getLanguageName(langCode));
    }
  };

  // Preset demo speech simulation (preserves sample audio testing capability)
  const handleSampleSpeech = (langCode) => {
    if (micState === "listening") {
      stopListening();
    }
    const sampleText =
      langCode === "ta-IN"
        ? "எங்கள் பகுதியில் ஐந்து நாட்களாக குடிநீர் வரவில்லை. பொதுமக்கள் மிகவும் சிரமப்படுகின்றனர். தயவுசெய்து உடனடி நடவடிக்கை எடுக்கவும்."
        : "Drinking water pipeline has broken near cross street 4 and clean water has been flooding the street for the last 3 days. Kindly repair urgently.";

    setSelectedLangCode(langCode);
    setLiveTranscript(sampleText);
    setErrorMessage("");

    const base = complaintText ? complaintText.trim() : "";
    const combined = base ? `${base} ${sampleText}` : sampleText;

    if (onTranscriptionChange) {
      onTranscriptionChange(combined);
    }
    if (onTranscriptionComplete) {
      onTranscriptionComplete(combined, getLanguageName(langCode));
    }
    setMicState("idle");
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentLang = VOICE_LANGUAGES.find((l) => l.code === selectedLangCode) || VOICE_LANGUAGES[0];

  return (
    <div className={`voice-recorder-box ${micState === "listening" ? "recording" : ""}`}>
      {/* 1. Language Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "0.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
          <Globe size={15} color="var(--primary)" />
          <span>Speech Language:</span>
        </div>
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--bg-card)",
            padding: "3px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            gap: "4px"
          }}
        >
          {VOICE_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`btn btn-sm ${selectedLangCode === lang.code ? "btn-primary" : "btn-ghost"}`}
              style={{
                fontSize: "0.78rem",
                padding: "0.25rem 0.65rem",
                fontWeight: selectedLangCode === lang.code ? 700 : 500
              }}
              disabled={micState === "listening"}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Microphone Action & States */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {/* Unsupported State Banner */}
        {micState === "unsupported" && (
          <div
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              border: "1px solid #f59e0b",
              color: "#b45309",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: "0.85rem",
              maxWidth: "520px",
              textAlign: "left",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px"
            }}
          >
            <MicOff size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", marginBottom: "2px" }}>
                Microphone State: Unsupported
              </strong>
              Browser speech recognition (Web Speech API) is not supported in this browser. Please use Google Chrome, Microsoft Edge, or another Chromium browser for voice recognition. You can still type your complaint below or test with a sample voice input.
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {micState === "error" && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              color: "#dc2626",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: "0.85rem",
              maxWidth: "520px",
              textAlign: "left",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px"
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: "block", marginBottom: "2px" }}>
                Microphone State: Error
              </strong>
              {errorMessage || "An error occurred during voice recognition."}
            </div>
          </div>
        )}

        {/* State Badge */}
        <div style={{ marginBottom: "0.75rem" }}>
          {micState === "idle" && (
            <span className="badge" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-medium)", color: "var(--text-secondary)", fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>
              Microphone State: <strong>Start Listening</strong>
            </span>
          )}
          {micState === "listening" && (
            <span className="badge" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>
              Microphone State: <strong>Listening ({currentLang.label})</strong>
            </span>
          )}
          {micState === "unsupported" && (
            <span className="badge" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", color: "#b45309", fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>
              Microphone State: <strong>Unsupported</strong>
            </span>
          )}
          {micState === "error" && (
            <span className="badge" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>
              Microphone State: <strong>Error</strong>
            </span>
          )}
        </div>

        {/* Central Pulsing Microphone Button */}
        <div style={{ position: "relative", marginBottom: "0.75rem" }}>
          <button
            type="button"
            className={`mic-btn-pulse ${micState === "listening" ? "active" : ""} ${
              micState === "unsupported" ? "disabled" : ""
            } ${micState === "error" ? "error-state" : ""}`}
            disabled={micState === "unsupported"}
            onClick={
              micState === "listening"
                ? stopListening
                : startListening
            }
            title={
              micState === "unsupported"
                ? "Speech recognition unsupported"
                : micState === "listening"
                ? "Click to Stop Listening"
                : micState === "error"
                ? "Click to retry (Start Listening)"
                : "Click to Start Listening"
            }
          >
            {micState === "listening" ? (
              <Square size={26} fill="white" />
            ) : micState === "unsupported" ? (
              <MicOff size={30} />
            ) : micState === "error" ? (
              <RotateCcw size={28} />
            ) : (
              <Mic size={32} />
            )}
          </button>
        </div>

        {/* Textual status & control buttons */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              color:
                micState === "listening"
                  ? "#ef4444"
                  : micState === "error"
                  ? "#dc2626"
                  : "var(--text-main)"
            }}
          >
            {micState === "listening" && `Listening... (${formatTimer(recordSeconds)})`}
            {micState === "idle" && "Ready to Listen"}
            {micState === "unsupported" && "Speech Recognition Unsupported"}
            {micState === "error" && "Microphone Error — Click to Retry"}
          </div>

          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.25rem", maxWidth: "460px" }}>
            {micState === "listening"
              ? `Speaking in ${currentLang.label}. Your words are transcribed into the complaint text area in real time.`
              : micState === "idle"
              ? `Click "Start Listening" to dictate your problem in ${currentLang.label}. You can edit the text before sending it to CivicAI.`
              : micState === "error"
              ? "Click retry above or check your microphone settings."
              : "Type your complaint directly in the box below."}
          </p>

          {/* Explicit State Action Buttons */}
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {micState === "listening" ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderColor: "#fca5a5",
                  fontWeight: 700
                }}
                onClick={stopListening}
              >
                <Square size={14} fill="#dc2626" />
                <span>Stop Listening</span>
              </button>
            ) : micState === "idle" ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={startListening}
              >
                <Mic size={14} />
                <span>Start Listening</span>
              </button>
            ) : micState === "error" ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={startListening}
              >
                <RotateCcw size={14} />
                <span>Start Listening (Retry)</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3. Waveform animation while listening */}
      {micState === "listening" && (
        <div className="waveform-container" style={{ margin: "0.5rem 0" }}>
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="waveform-bar"
              style={{
                animationDelay: `${(i * 0.08).toFixed(2)}s`,
                height: `${10 + (i % 5) * 5}px`
              }}
            />
          ))}
        </div>
      )}

      {/* 4. Live Speech Recognition Feedback */}
      {liveTranscript && (
        <div
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.85rem 1.1rem",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            textAlign: "left"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.35rem"
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Volume2 size={13} color="var(--primary)" />
              Live Transcribed Speech ({currentLang.label})
            </span>
            <span className="badge badge-ai" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
              <Sparkles size={11} /> Web Speech API
            </span>
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.45, margin: 0 }}>
            {liveTranscript}
          </p>
        </div>
      )}

      {/* 5. Demo / Simulation Helper for environments without audio hardware */}
      <div
        style={{
          marginTop: "1rem",
          paddingTop: "0.75rem",
          borderTop: "1px dashed var(--border-subtle)",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.78rem",
          color: "var(--text-muted)"
        }}
      >
        <span>Test Speech Without Mic Hardware:</span>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.725rem", padding: "0.2rem 0.5rem" }}
            onClick={() => handleSampleSpeech("ta-IN")}
          >
            <span>🇮🇳 Test Tamil Speech</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.725rem", padding: "0.2rem 0.5rem" }}
            onClick={() => handleSampleSpeech("en-IN")}
          >
            <span>🇮🇳 Test English Speech</span>
          </button>
        </div>
      </div>
    </div>
  );
}
