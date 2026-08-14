import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accent?: "blue" | "green" | "amber" | "red" | "purple";
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accent = "blue",
  className = "",
  onClick,
}) => {
  return (
    <div
      className={`stat-card accent-${accent} ${className}`.trim()}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="stat-main">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
    </div>
  );
};
