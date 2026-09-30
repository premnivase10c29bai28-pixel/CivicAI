import React from "react";
import { 
  FileText, 
  Inbox, 
  Search, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

export default function StatusBadge({ status, size = "md" }) {
  const getStatusConfig = (st) => {
    const clean = (st || "").toString().toLowerCase().replace(/_/g, " ").trim();
    switch (clean) {
      case "reported":
        return {
          label: "Reported",
          className: "badge-reported",
          icon: FileText
        };
      case "received":
        return {
          label: "Received",
          className: "badge-received",
          icon: Inbox
        };
      case "under review":
        return {
          label: "Under Review",
          className: "badge-review",
          icon: Search
        };
      case "assigned":
        return {
          label: "Assigned",
          className: "badge-assigned",
          icon: UserCheck
        };
      case "in progress":
        return {
          label: "In Progress",
          className: "badge-progress",
          icon: Wrench
        };
      case "resolved":
        return {
          label: "Resolved",
          className: "badge-resolved",
          icon: CheckCircle2
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "badge-rejected",
          icon: XCircle
        };
      default:
        return {
          label: status || "Reported",
          className: "badge-reported",
          icon: FileText
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = size === "sm" ? "text-xs py-0.5 px-2" : "text-xs py-1 px-2.5";

  return (
    <span className={`badge ${config.className} ${sizeClasses}`}>
      <Icon size={13} strokeWidth={2.2} />
      <span>{config.label}</span>
    </span>
  );
}
