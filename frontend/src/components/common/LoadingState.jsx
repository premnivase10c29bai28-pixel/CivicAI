import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading civic data..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "1rem"
      }}
    >
      <Loader2
        size={36}
        className="animate-spin"
        style={{
          animation: "spin 1s linear infinite",
          color: "var(--primary)"
        }}
      />
      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>
        {message}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
