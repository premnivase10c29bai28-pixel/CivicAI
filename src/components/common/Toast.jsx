import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";

export default function Toast() {
  const { toasts, removeToast } = useCivicData();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} color="#059669" />;
      case "error":
        return <AlertTriangle size={18} color="#dc2626" />;
      default:
        return <Info size={18} color="#2563eb" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type || "info"}`}>
          {getIcon(toast.type)}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
