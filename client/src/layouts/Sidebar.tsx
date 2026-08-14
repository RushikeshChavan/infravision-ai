import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Briefcase,
  DollarSign,
  Flag,
  ClipboardCheck,
  FileText,
  Eye,
  ShieldAlert,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../types";
import { getInitials } from "../utils/formatters";

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const isSuperAdmin = role === USER_ROLES.SUPER_ADMIN;
  const isDeptAdmin = role === USER_ROLES.DEPARTMENT_ADMIN;
  const isAdmin = isSuperAdmin || isDeptAdmin;
  const isPM = role === USER_ROLES.PROJECT_MANAGER;
  const isFE = role === USER_ROLES.FIELD_ENGINEER;
  const isContractor = role === USER_ROLES.CONTRACTOR;
  const isAuditor = role === USER_ROLES.AUDITOR;
  const isCitizen = role === USER_ROLES.CITIZEN;

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Building2 size={20} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">InfraVision AI</span>
            <span className="sidebar-brand-sub">Govt Infra Monitoring</span>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <div className="sidebar-content">
          {/* Section: Main Overview */}
          <div>
            <div className="nav-group-title">Overview</div>
            <ul className="nav-list">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                  onClick={onCloseMobile}
                >
                  <LayoutDashboard className="nav-item-icon" />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                  onClick={onCloseMobile}
                >
                  <Building2 className="nav-item-icon" />
                  <span>
                    {isContractor ? "My Projects" : isCitizen ? "Public Projects" : "Projects"}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                  onClick={onCloseMobile}
                >
                  <MapPin className="nav-item-icon" />
                  <span>GIS Project Map</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Section: Administration (Super Admin / Dept Admin) */}
          {isAdmin && (
            <div>
              <div className="nav-group-title">Administration</div>
              <ul className="nav-list">
                <li>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                    onClick={onCloseMobile}
                  >
                    <Users className="nav-item-icon" />
                    <span>User Management</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/contractors"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                    onClick={onCloseMobile}
                  >
                    <Briefcase className="nav-item-icon" />
                    <span>Contractors</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/budgets"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                    onClick={onCloseMobile}
                  >
                    <DollarSign className="nav-item-icon" />
                    <span>Budget Allocation</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          {/* Section: Project Execution & Tracking (PM, FE, Contractor, Auditor, Admin) */}
          {(isAdmin || isPM || isFE || isContractor || isAuditor) && (
            <div>
              <div className="nav-group-title">Execution & Tracking</div>
              <ul className="nav-list">
                <li>
                  <NavLink
                    to="/milestones"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                    onClick={onCloseMobile}
                  >
                    <Flag className="nav-item-icon" />
                    <span>Milestones</span>
                  </NavLink>
                </li>

                {/* Inspections (All except contractor & citizen) */}
                {!isContractor && !isCitizen && (
                  <li>
                    <NavLink
                      to="/inspections"
                      className={({ isActive }) =>
                        `nav-item-link ${isActive ? "active" : ""}`
                      }
                      onClick={onCloseMobile}
                    >
                      <ClipboardCheck className="nav-item-icon" />
                      <span>Field Inspections</span>
                    </NavLink>
                  </li>
                )}

                {/* Documents (Internal roles) */}
                <li>
                  <NavLink
                    to="/documents"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                    onClick={onCloseMobile}
                  >
                    <FileText className="nav-item-icon" />
                    <span>Documents Repository</span>
                  </NavLink>
                </li>

                {/* Auditor specific Budgets link */}
                {isAuditor && (
                  <li>
                    <NavLink
                      to="/admin/budgets"
                      className={({ isActive }) =>
                        `nav-item-link ${isActive ? "active" : ""}`
                      }
                      onClick={onCloseMobile}
                    >
                      <DollarSign className="nav-item-icon" />
                      <span>Financial Audit</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Section: Public & Transparency (Citizen or All) */}
          {isCitizen && (
            <div>
              <div className="nav-group-title">Transparency</div>
              <ul className="nav-list">
                <li>
                  <NavLink
                    to="/citizen"
                    className={({ isActive }) =>
                      `nav-item-link ${isActive ? "active" : ""}`
                    }
                    onClick={onCloseMobile}
                  >
                    <Eye className="nav-item-icon" />
                    <span>Citizen Portal</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer with User info */}
        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <div className="sidebar-user-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={user?.name}>
                {user?.name || "Anonymous"}
              </span>
              <span className="sidebar-user-role" title={user?.role}>
                {user?.role || "Citizen"}
              </span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
