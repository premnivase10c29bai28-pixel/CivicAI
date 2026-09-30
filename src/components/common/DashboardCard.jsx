import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = "up",
  accentColor = "#2563eb",
  onClick
}) {
  return (
    <div
      className="kpi-card"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="kpi-top">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div
            className="kpi-icon-wrap"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div className="kpi-value">{value}</div>

      {(subtitle || trend) && (
        <div className="kpi-footer">
          {trend && (
            <span
              className={
                trendDirection === "up" ? "kpi-trend-up" : "kpi-trend-down"
              }
            >
              {trendDirection === "up" ? (
                <TrendingUp size={13} />
              ) : (
                <TrendingDown size={13} />
              )}
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
