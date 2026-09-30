import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search complaints by ID, category, location, or keyword...",
  onClear
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        flex: 1,
        minWidth: "260px"
      }}
    >
      <Search
        size={17}
        style={{
          position: "absolute",
          left: "12px",
          color: "var(--text-muted)",
          pointerEvents: "none"
        }}
      />
      <input
        type="text"
        className="input-field"
        style={{
          paddingLeft: "38px",
          paddingRight: value ? "36px" : "12px",
          height: "40px"
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange("");
          }}
          style={{
            position: "absolute",
            right: "10px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: "4px"
          }}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
