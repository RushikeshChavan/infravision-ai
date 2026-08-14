import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { RiskLevel } from "../utils/riskEngine";

export interface RiskBadgeProps {
  riskLevel: RiskLevel;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskLevel,
  showIcon = true,
  className = "",
  size = "md",
}) => {
  let badgeClass = "badge";
  let icon = <CheckCircle2 size={13} />;

  if (riskLevel === "At Risk") {
    badgeClass += " badge-status-delayed";
    icon = <AlertTriangle size={13} />;
  } else if (riskLevel === "Needs Attention") {
    badgeClass += " badge-status-pending";
    icon = <AlertCircle size={13} />;
  } else {
    badgeClass += " badge-status-completed";
    icon = <CheckCircle2 size={13} />;
  }

  const paddingStyle = size === "sm" ? { padding: "2px 8px", fontSize: "0.72rem" } : { padding: "4px 10px", fontSize: "0.78rem" };

  return (
    <span
      className={`${badgeClass} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontWeight: 600,
        ...paddingStyle,
      }}
      title="Intelligent Rule-Based Project Risk Evaluation"
    >
      {showIcon && icon}
      <span>{riskLevel}</span>
    </span>
  );
};
