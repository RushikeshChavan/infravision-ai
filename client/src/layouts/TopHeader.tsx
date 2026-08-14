import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Shield,
  LogOut,
  ChevronDown,
  UserCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { USER_ROLES } from "../types";
import { getInitials } from "../utils/formatters";

export interface TopHeaderProps {
  onToggleMobileMenu: () => void;
}

const DEMO_ROLES_LIST = [
  { role: USER_ROLES.SUPER_ADMIN, email: "admin@infravision.gov", title: "Super Admin (Full Access)" },
  { role: USER_ROLES.DEPARTMENT_ADMIN, email: "deptadmin@pwd.gov", title: "Dept Admin (PWD Oversight)" },
  { role: USER_ROLES.PROJECT_MANAGER, email: "pm@pwd.gov", title: "Project Manager (Execution)" },
  { role: USER_ROLES.FIELD_ENGINEER, email: "field@pwd.gov", title: "Field Engineer (GPS Quality)" },
  { role: USER_ROLES.CONTRACTOR, email: "contractor@infra.com", title: "Contractor (L&T Infra)" },
  { role: USER_ROLES.AUDITOR, email: "auditor@cag.gov", title: "Auditor (CAG Financials)" },
  { role: USER_ROLES.CITIZEN, email: "citizen@public.org", title: "Citizen (Public Open Data)" },
];

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  // Derive human-readable page title
  const getPageTitle = (pathname: string): string => {
    if (pathname === "/" || pathname === "/dashboard") return "Executive Dashboard";
    if (pathname === "/projects") return "Infrastructure Projects";
    if (pathname.startsWith("/projects/")) return "Project Details";
    if (pathname === "/map") return "GIS Infrastructure Map";
    if (pathname === "/admin/users") return "User Management";
    if (pathname === "/admin/contractors") return "Contractors Directory";
    if (pathname === "/admin/budgets") return "Budget Allocation & Spending";
    if (pathname === "/milestones") return "Milestone Tracking";
    if (pathname === "/inspections") return "Field Inspections";
    if (pathname === "/documents") return "Project Documents";
    if (pathname === "/citizen") return "Citizen Transparency Portal";
    return "InfraVision AI";
  };

  const handleQuickRoleSwitch = async (email: string) => {
    setSwitchingRole(true);
    try {
      await login({ email, password: "Password@123" });
      setShowRoleSwitcher(false);
    } catch (err: any) {
      console.error("Role switch failed:", err);
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="header-page-title">{getPageTitle(location.pathname)}</h2>
        </div>
      </div>

      <div className="header-right">
        {/* Official Portal Pill */}
        <div className="header-badge-gov">
          <Shield size={13} />
          <span>Govt of India · Infra Monitoring</span>
        </div>

        {/* Demo Quick Role Switcher */}
        <div style={{ position: "relative" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowUserDropdown(false);
            }}
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-primary)",
              backgroundColor: "var(--color-surface)",
              fontWeight: 600,
            }}
            icon={<UserCheck size={14} color="var(--color-accent)" />}
          >
            <span>Switch Role</span>
            <ChevronDown size={13} />
          </Button>

          {showRoleSwitcher && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                width: "280px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--color-border)",
                padding: "8px",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "6px 10px 10px 10px",
                  borderBottom: "1px solid var(--color-divider)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.05em",
                }}
              >
                1-Click Demo Role Switcher
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                {DEMO_ROLES_LIST.map((item) => {
                  const isActive = user?.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleQuickRoleSwitch(item.email)}
                      disabled={switchingRole}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {item.role}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                          {item.title}
                        </div>
                      </div>
                      {isActive && <Check size={16} color="var(--color-primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon (demo indicator) */}
        <button
          className="btn btn-ghost btn-sm btn-icon-only"
          title="Notifications"
          style={{ position: "relative" }}
        >
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "var(--color-danger)",
            }}
          />
        </button>

        {/* User Info & Badge */}
        <div className="header-user-menu" style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "var(--radius-md)",
            }}
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowRoleSwitcher(false);
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {user?.name || "User"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Badge role={user?.role} style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                  {user?.role}
                </Badge>
                {user?.department && (
                  <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                    · {user.department}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} />
          </div>

          {/* User Dropdown */}
          {showUserDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                width: "240px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--color-border)",
                padding: "8px",
                zIndex: 100,
              }}
            >
              <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--color-divider)", marginBottom: "4px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{user?.email}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  Role: <strong>{user?.role}</strong>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  color: "var(--color-danger)",
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
