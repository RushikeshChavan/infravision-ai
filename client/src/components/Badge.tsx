import React from "react";
import { ProjectStatus, MilestoneStatus, UserRole } from "../types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "status"
    | "role"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "planned";
  status?: ProjectStatus | MilestoneStatus | string;
  role?: UserRole | string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  status,
  role,
  dot = false,
  className = "",
  ...props
}) => {
  let badgeClass = "badge";

  if (status) {
    const normalized = status.toLowerCase().replace(/[\s-_]/g, "");
    if (normalized === "ongoing" || normalized === "inprogress") {
      badgeClass += " badge-status-ongoing";
    } else if (normalized === "completed" || normalized === "active") {
      badgeClass += " badge-status-completed";
    } else if (normalized === "delayed" || normalized === "cancelled" || normalized === "failed" || normalized === "blocked") {
      badgeClass += " badge-status-delayed";
    } else if (normalized === "planned" || normalized === "scheduled") {
      badgeClass += " badge-status-planned";
    } else if (normalized === "pending" || normalized === "inactive") {
      badgeClass += " badge-status-pending";
    } else {
      badgeClass += " badge-status-ongoing";
    }
  } else if (role) {
    const normalized = role.toLowerCase().replace(/[\s-_]/g, "");
    if (normalized === "superadmin") {
      badgeClass += " badge-role-super-admin";
    } else if (normalized === "departmentadmin") {
      badgeClass += " badge-role-department-admin";
    } else if (normalized === "projectmanager") {
      badgeClass += " badge-role-project-manager";
    } else if (normalized === "fieldengineer") {
      badgeClass += " badge-role-field-engineer";
    } else if (normalized === "contractor") {
      badgeClass += " badge-role-contractor";
    } else if (normalized === "auditor") {
      badgeClass += " badge-role-auditor";
    } else if (normalized === "citizen") {
      badgeClass += " badge-role-citizen";
    } else {
      badgeClass += " badge-role-citizen";
    }
  } else if (variant !== "default") {
    badgeClass += ` badge-status-${variant}`;
  }

  return (
    <span className={`${badgeClass} ${className}`.trim()} {...props}>
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "currentColor",
            display: "inline-block",
            marginRight: "4px",
          }}
        />
      )}
      {children || status || role}
    </span>
  );
};
