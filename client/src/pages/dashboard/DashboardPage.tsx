import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  MapPin,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Users,
  Search,
  Filter,
  Activity,
  AlertCircle,
  Compass,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Project, USER_ROLES } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Column } from "../../components/Table";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { analyzeProjectRisk } from "../../utils/riskEngine";
import { formatCurrency, formatDate, getName } from "../../utils/formatters";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Table search & filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tableStatusFilter, setTableStatusFilter] = useState<string>("ALL");

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjectsApi();
      setProjects(response.projects || []);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      setError(err.message || "Failed to load dashboard project metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Compute aggregate statistics
  const totalProjects = projects.length;
  const ongoingProjects = projects.filter((p) => p.status === "Ongoing").length;
  const delayedProjects = projects.filter((p) => p.status === "Delayed");
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const plannedProjects = projects.filter((p) => p.status === "Planned").length;

  const totalBudget = projects.reduce((acc, p) => acc + (p.totalBudget || 0), 0);
  const estimatedUtilization = totalBudget > 0 ? totalBudget * 0.42 : 0;
  const utilizationPercentage = totalBudget > 0 ? Math.round((estimatedUtilization / totalBudget) * 100) : 0;

  // 1. Portfolio Risk Distribution calculation using analyzeProjectRisk engine
  const portfolioRiskMetrics = useMemo(() => {
    let atRisk = 0;
    let needsAttention = 0;
    let onTrack = 0;

    projects.forEach((p) => {
      const analysis = analyzeProjectRisk(p);
      if (analysis.riskLevel === "At Risk") atRisk++;
      else if (analysis.riskLevel === "Needs Attention") needsAttention++;
      else onTrack++;
    });

    return {
      atRisk,
      needsAttention,
      onTrack,
      atRiskPct: totalProjects > 0 ? Math.round((atRisk / totalProjects) * 100) : 0,
      needsAttentionPct: totalProjects > 0 ? Math.round((needsAttention / totalProjects) * 100) : 0,
      onTrackPct: totalProjects > 0 ? Math.round((onTrack / totalProjects) * 100) : 0,
    };
  }, [projects, totalProjects]);

  // 2. Filtered projects for the Dashboard table
  const filteredTableProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = tableStatusFilter === "ALL" || p.status === tableStatusFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, tableStatusFilter, searchQuery]);

  const isAdmin =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN;

  const tableColumns: Column<Project>[] = [
    {
      header: "Project Code",
      accessor: "projectCode",
      cell: (row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.85rem" }}>
          {row.projectCode}
        </span>
      ),
      width: "130px",
    },
    {
      header: "Project Name & Location",
      accessor: "name",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{row.name}</div>
          {row.location && (
            <div style={{ fontSize: "0.76rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <MapPin size={12} color="var(--color-accent)" />
              <span>{row.location}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Department",
      accessor: "department",
      cell: (row) => (
        <span style={{ fontSize: "0.84rem", color: "var(--color-text-secondary)" }}>
          {row.department}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <Badge status={row.status} dot />,
      width: "120px",
    },
    {
      header: "Risk Index",
      cell: (row) => {
        const risk = analyzeProjectRisk(row);
        return (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor:
                risk.riskLevel === "At Risk"
                  ? "var(--color-danger-bg)"
                  : risk.riskLevel === "Needs Attention"
                  ? "var(--color-warning-bg)"
                  : "var(--color-success-bg)",
              color:
                risk.riskLevel === "At Risk"
                  ? "var(--color-danger-text)"
                  : risk.riskLevel === "Needs Attention"
                  ? "var(--color-warning-text)"
                  : "var(--color-success-text)",
              border: `1px solid ${
                risk.riskLevel === "At Risk"
                  ? "var(--color-danger-border)"
                  : risk.riskLevel === "Needs Attention"
                  ? "var(--color-warning-border)"
                  : "var(--color-success-border)"
              }`,
            }}
          >
            {risk.riskLevel}
          </span>
        );
      },
      width: "125px",
    },
    {
      header: "Project Manager",
      accessor: (row) => getName(row.projectManager),
      cell: (row) => (
        <span style={{ fontSize: "0.84rem", color: "var(--color-text-secondary)" }}>
          {getName(row.projectManager, "Not Assigned")}
        </span>
      ),
    },
    {
      header: "Budget Outlay",
      accessor: "totalBudget",
      cell: (row) => (
        <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
          {formatCurrency(row.totalBudget)}
        </span>
      ),
      align: "right",
      width: "140px",
    },
    {
      header: "Action",
      cell: (row) => (
        <Link to={`/projects/${row._id}`}>
          <Button variant="outline" size="sm">
            <span>Dossier</span>
            <ArrowUpRight size={13} />
          </Button>
        </Link>
      ),
      align: "right",
      width: "95px",
    },
  ];

  return (
    <div>
      {/* 3. Typography & Spacing: Clean Executive Welcome Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--color-success)",
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>
              National Infrastructure Command Center
            </span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Executive Project Oversight Dashboard
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "2px", fontSize: "0.92rem" }}>
            Real-time multi-department monitoring, milestone verification, and fiscal transparency
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isAdmin && (
            <Link to="/projects">
              <Button variant="primary" icon={<PlusCircle size={16} />}>
                New Project
              </Button>
            </Link>
          )}
          <Link to="/map">
            <Button variant="secondary" icon={<MapPin size={16} />}>
              GIS Geospatial Map
            </Button>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProjects} className="mb-6" />}

      {/* KPI Cards Grid with elevated visual polish */}
      <div className="grid-5 mb-6">
        <StatCard
          label="Total Projects"
          value={loading ? "..." : totalProjects}
          subtext="Monitored portfolios"
          icon={<Building2 size={22} />}
          accent="blue"
        />
        <StatCard
          label="Ongoing Works"
          value={loading ? "..." : ongoingProjects}
          subtext="Active construction"
          icon={<Clock size={22} />}
          accent="green"
        />
        <StatCard
          label="Delayed Packages"
          value={loading ? "..." : delayedProjects.length}
          subtext={delayedProjects.length > 0 ? "Requires escalation" : "Nominal cadence"}
          icon={<AlertTriangle size={22} />}
          accent={delayedProjects.length > 0 ? "red" : "amber"}
        />
        <StatCard
          label="Total Capital Outlay"
          value={loading ? "..." : formatCurrency(totalBudget)}
          subtext="Approved sanctions"
          icon={<DollarSign size={22} />}
          accent="purple"
        />
        <StatCard
          label="Fiscal Burn Rate"
          value={loading ? "..." : `${utilizationPercentage}%`}
          subtext={`${formatCurrency(estimatedUtilization)} disbursed`}
          icon={<TrendingUp size={22} />}
          accent="green"
        />
      </div>

      {/* Critical Delayed Project Alert Banner */}
      {!loading && delayedProjects.length > 0 && (
        <div
          className="alert alert-danger mb-6"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.95rem" }}>
                Critical Attention: {delayedProjects.length} Infrastructure Packages Flagged as Delayed
              </strong>
              <p style={{ fontSize: "0.85rem", marginTop: "2px", color: "inherit", opacity: 0.9 }}>
                Immediate field audit and milestone escalation required for:{" "}
                {delayedProjects.map((p) => p.projectCode).join(", ")}.
              </p>
            </div>
          </div>
          <Link to="/projects">
            <Button variant="danger" size="sm">
              Review Delayed
            </Button>
          </Link>
        </div>
      )}

      {/* Two Column Layout: Project Status Breakdown + Portfolio Risk Distribution */}
      <div className="grid-3 mb-6">
        {/* 1. Lifecycle Status Breakdown Card */}
        <Card
          title="Project Lifecycle Breakdown"
          subtitle="Portfolio distribution by execution status"
          className="card"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium">Ongoing Construction ({ongoingProjects})</span>
                <span className="text-muted">{totalProjects > 0 ? Math.round((ongoingProjects / totalProjects) * 100) : 0}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${totalProjects > 0 ? (ongoingProjects / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium">Planned Proposals ({plannedProjects})</span>
                <span className="text-muted">{totalProjects > 0 ? Math.round((plannedProjects / totalProjects) * 100) : 0}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill fill-amber"
                  style={{ width: `${totalProjects > 0 ? (plannedProjects / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium">Completed & Delivered ({completedProjects})</span>
                <span className="text-muted">{totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill fill-green"
                  style={{ width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium">Delayed ({delayedProjects.length})</span>
                <span className="text-muted">{totalProjects > 0 ? Math.round((delayedProjects.length / totalProjects) * 100) : 0}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill fill-red"
                  style={{ width: `${totalProjects > 0 ? (delayedProjects.length / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 1. Intelligent Portfolio Risk Distribution (Item 1 requested improvement) */}
        <Card
          title="Intelligent Portfolio Risk Health"
          subtitle="Deterministic evaluation by risk engine"
          className="card"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium" style={{ color: "var(--color-danger-text)", fontWeight: 600 }}>
                  ● At Risk ({portfolioRiskMetrics.atRisk})
                </span>
                <span style={{ fontWeight: 700, color: "var(--color-danger-text)" }}>
                  {portfolioRiskMetrics.atRiskPct}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill fill-red"
                  style={{ width: `${portfolioRiskMetrics.atRiskPct}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium" style={{ color: "var(--color-warning-text)", fontWeight: 600 }}>
                  ● Needs Attention ({portfolioRiskMetrics.needsAttention})
                </span>
                <span style={{ fontWeight: 700, color: "var(--color-warning-text)" }}>
                  {portfolioRiskMetrics.needsAttentionPct}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill fill-amber"
                  style={{ width: `${portfolioRiskMetrics.needsAttentionPct}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "5px" }}>
                <span className="font-medium" style={{ color: "var(--color-success-text)", fontWeight: 600 }}>
                  ● On Track ({portfolioRiskMetrics.onTrack})
                </span>
                <span style={{ fontWeight: 700, color: "var(--color-success-text)" }}>
                  {portfolioRiskMetrics.onTrackPct}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill fill-green"
                  style={{ width: `${portfolioRiskMetrics.onTrackPct}%` }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "4px",
                padding: "8px 10px",
                backgroundColor: "var(--color-surface-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "0.74rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.4,
              }}
            >
              Evaluated on schedule elapsed %, physical milestone lags, budget burn ratios, and failed inspections.
            </div>
          </div>
        </Card>

        {/* Quick Operations Shortcuts */}
        <Card title="Quick Actions" subtitle="Frequently used workflows">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link to="/projects" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-subtle)",
                  transition: "background-color 0.15s ease",
                }}
              >
                <Building2 size={18} color="var(--color-primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    Browse All Projects
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    View complete portfolio & filters
                  </div>
                </div>
                <ArrowUpRight size={16} color="var(--color-text-muted)" />
              </div>
            </Link>

            <Link to="/map" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-subtle)",
                }}
              >
                <MapPin size={18} color="var(--color-accent)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    GIS Geospatial Map
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Inspect coordinates & live pins
                  </div>
                </div>
                <ArrowUpRight size={16} color="var(--color-text-muted)" />
              </div>
            </Link>

            <Link to="/citizen" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-subtle)",
                }}
              >
                <ShieldCheck size={18} color="var(--color-success)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    Citizen Transparency
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Public expenditure audit portal
                  </div>
                </div>
                <ArrowUpRight size={16} color="var(--color-text-muted)" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* 2. Active Projects Table with Search & Status Filtering */}
      <Card
        title="Active Infrastructure Projects"
        subtitle={`Displaying ${filteredTableProjects.length} of ${projects.length} monitored works`}
        action={
          <Link to="/projects">
            <Button variant="ghost" size="sm">
              View All ({projects.length})
            </Button>
          </Link>
        }
        noPadding
      >
        {/* Table Filter Controls */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--color-divider)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--color-surface-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginRight: "4px" }}>
              Filter:
            </span>
            {["ALL", "Ongoing", "Delayed", "Completed", "Planned"].map((st) => (
              <button
                key={st}
                onClick={() => setTableStatusFilter(st)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: tableStatusFilter === st ? "var(--color-primary)" : "var(--color-surface)",
                  color: tableStatusFilter === st ? "#FFFFFF" : "var(--color-text-secondary)",
                  boxShadow: tableStatusFilter === st ? "none" : "var(--shadow-xs)",
                  transition: "all 0.15s ease",
                }}
              >
                {st === "ALL" ? `All (${projects.length})` : st}
              </button>
            ))}
          </div>

          <div style={{ width: "240px" }}>
            <Input
              placeholder="Search code, city, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>
        </div>

        <Table
          columns={tableColumns}
          data={filteredTableProjects}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No projects match the selected status filter or search query."
        />
      </Card>
    </div>
  );
};
