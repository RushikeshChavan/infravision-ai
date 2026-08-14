import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { Button } from "../components/Button";

export interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          padding: "40px 20px",
          maxWidth: "600px",
          margin: "40px auto",
          textAlign: "center",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
          Access Restricted
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>
          Your current role (<strong>{user?.role || "Citizen"}</strong>) does not have sufficient permissions to access this administrative section.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return children;
};
