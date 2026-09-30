import React, { useState, useEffect } from "react";
import { Mic, Square, Sparkles, Volume2 } from "lucide-react";

export default function VoiceRecorderUI({ onTranscriptionComplete, preferredLanguage = "Tamil" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscribedText("Listening to voice in " + preferredLanguage + "...");
      // Simulate real-time streaming audio transcription after 3 seconds
      setTimeout(() => {
        const sampleVoiceText =
          preferredLanguage === "Tamil"
            ? "எங்கள் பகுதியில் ஐந்து நாட்களாக குடிநீர் வரவில்லை. பொதுமக்கள் மிகவும் சிரமப்படுகின்றனர். தயவுசெய்து உடனடி நடவடிக்கை எடுக்கவும்."
            : "Drinking water has not been available in our area for the last 5 days. Kindly resolve this urgently.";
        setTranscribedText(sampleVoiceText);
        setIsRecording(false);
        if (onTranscriptionComplete) {
          onTranscriptionComplete(sampleVoiceText, preferredLanguage);
        }
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`voice-recorder-box ${isRecording ? "recording" : ""}`}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button
          type="button"
          className={`mic-btn-pulse ${isRecording ? "active" : ""}`}
          onClick={toggleRecording}
          title={isRecording ? "Stop recording" : "Click to speak"}
        >
          {isRecording ? <Square size={26} fill="white" /> : <Mic size={32} />}
        </button>

        <span
          style={{
            marginTop: "1rem",
            fontWeight: 600,
            fontSize: "1rem",
            color: isRecording ? "#ef4444" : "var(--text-main)"
          }}
        >
          {isRecording ? `Recording audio (${formatTimer(recordSeconds)})...` : "Speak your complaint"}
        </span>

        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          {isRecording
            ? "Speak clearly in Tamil, English, or any regional language. CivicAI processes audio automatically."
            : "Click the microphone button to dictate your complaint using voice"}
        </p>
      </div>

      {isRecording && (
        <div className="waveform-container">
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

      {transcribedText && (
        <div
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.9rem 1.1rem",
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
              marginBottom: "0.4rem"
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Volume2 size={13} />
              Transcribed Speech ({preferredLanguage})
            </span>
            <span className="badge badge-ai" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
              <Sparkles size={11} /> AI Speech-to-Text
            </span>
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.4 }}>
            {transcribedText}
          </p>
        </div>
      )}
    </div>
  );
}
