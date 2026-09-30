import React, { useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

const SAMPLE_CIVIC_PHOTOS = [
  {
    label: "Water Leakage",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
  },
  {
    label: "Road Pothole",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"
  },
  {
    label: "Garbage Pile",
    url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80"
  },
  {
    label: "Broken Light",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
  }
];

export default function ImageUploader({ images = [], onImagesChange }) {
  const [imageList, setImageList] = useState(images);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setImageList(images || []);
  }, [images]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const updated = [...imageList, localUrl];
    setImageList(updated);
    if (onImagesChange) onImagesChange(updated);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const localUrl = URL.createObjectURL(file);
      const updated = [...imageList, localUrl];
      setImageList(updated);
      if (onImagesChange) onImagesChange(updated);
    }
  };

  const addSamplePhoto = (url) => {
    if (!imageList.includes(url)) {
      const updated = [...imageList, url];
      setImageList(updated);
      if (onImagesChange) onImagesChange(updated);
    }
  };

  const removePhoto = (index) => {
    const updated = imageList.filter((_, idx) => idx !== index);
    setImageList(updated);
    if (onImagesChange) onImagesChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {/* Upload Dropzone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px dashed var(--primary)" : "2px dashed var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          backgroundColor: isDragging ? "rgba(37, 99, 235, 0.04)" : "var(--bg-subtle)",
          cursor: "pointer",
          transition: "border-color 0.2s ease, background-color 0.2s ease"
        }}
      >
        <UploadCloud size={32} color="var(--primary)" />
        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
          Click or drag & drop photo of the problem
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Supports JPG, PNG, WEBP up to 10MB (Local preview demo mode)
        </span>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </label>

      {/* Preset demo samples */}
      <div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
          Demo quick select photos:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {SAMPLE_CIVIC_PHOTOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => addSamplePhoto(sample.url)}
              style={{ fontSize: "0.75rem" }}
            >
              <ImageIcon size={12} />
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear message when photo is attached */}
      {imageList.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 0.85rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#059669",
            fontSize: "0.85rem",
            fontWeight: 500
          }}
        >
          <CheckCircle2 size={16} />
          <span>Photo attached locally (demo mode)</span>
        </div>
      )}

      {/* Image Preview List */}
      {imageList.length > 0 && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
          {imageList.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--border-medium)"
              }}
            >
              <img
                src={url}
                alt="Civic issue evidence"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(0, 0, 0, 0.65)",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
