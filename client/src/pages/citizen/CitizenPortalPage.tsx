import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Search,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { Project } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { Card } from "../../components/Card";
import { StatCard } from "../../components/StatCard";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Table, Column } from "../../components/Table";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const CitizenPortalPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const response = await getProjectsApi();
        setProjects(response.projects || []);
      } catch (err: any) {
        setError(err.message || "Failed to load public infrastructure catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const totalPublicProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const ongoingProjects = projects.filter((p) => p.status === "Ongoing").length;
  const totalPublicInvestment = projects.reduce((acc, p) => acc + (p.totalBudget || 0), 0);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Project>[] = [
    {
      header: "Project ID",
      accessor: "projectCode",
      cell: (row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-primary)" }}>
          {row.projectCode}
        </span>
      ),
      width: "120px",
    },
    {
      header: "Infrastructure Project",
      accessor: "name",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          {row.location && (
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={12} />
              <span>{row.location}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Department",
      accessor: "department",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <Badge status={row.status} dot />,
      width: "120px",
    },
    {
      header: "Public Investment",
      accessor: "totalBudget",
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(row.totalBudget)}</span>
      ),
      align: "right",
    },
    {
      header: "Transparency Record",
      cell: (row) => (
        <Link to={`/projects/${row._id}`}>
          <Button variant="outline" size="sm">
            <span>Audit View</span>
            <Eye size={14} />
          </Button>
        </Link>
      ),
      align: "right",
      width: "120px",
    },
  ];

  return (
    <div>
      {/* Citizen Transparency Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F294A 0%, #1E3E62 100%)",
          color: "#FFFFFF",
          padding: "28px 32px",
          borderRadius: "var(--radius-xl)",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px" }}>
            <ShieldCheck size={14} />
            <span>Public Open Data Initiative</span>
          </div>
          <h1 style={{ color: "#FFFFFF", fontSize: "1.75rem", fontWeight: 700 }}>
            Citizen Transparency Portal
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", marginTop: "4px", maxWidth: "650px", fontSize: "0.95rem" }}>
            Inspect public taxpayer investments, road and bridge milestones, and verifiable completion progress across your region.
          </p>
        </div>

        <Link to="/map">
          <Button variant="accent" size="lg" icon={<MapPin size={18} />}>
            Explore Geospatial Map
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => window.location.reload()} className="mb-6" />}

      {/* Public Metrics */}
      <div className="grid-4 mb-6">
        <StatCard
          label="Monitored Projects"
          value={loading ? "..." : totalPublicProjects}
          subtext="Under active citizen monitoring"
          icon={<Building2 size={22} />}
          accent="blue"
        />
        <StatCard
          label="Active Works"
          value={loading ? "..." : ongoingProjects}
          subtext="Currently under construction"
          icon={<TrendingUp size={22} />}
          accent="amber"
        />
        <StatCard
          label="Delivered Public Assets"
          value={loading ? "..." : completedProjects}
          subtext="Verified & handed over"
          icon={<CheckCircle2 size={22} />}
          accent="green"
        />
        <StatCard
          label="Total Public Outlay"
          value={loading ? "..." : formatCurrency(totalPublicInvestment)}
          subtext="Public infrastructure capital"
          icon={<DollarSign size={22} />}
          accent="purple"
        />
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          <Input
            label="Search Public Projects"
            placeholder="Search by city, project code, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />

          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Project Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Ongoing">Ongoing Construction</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed & Delivered</option>
          </Select>
        </div>
      </Card>

      {/* Projects Table */}
      <Card title="Public Projects Register" subtitle="Verifiable open data records" noPadding>
        <Table
          columns={columns}
          data={filteredProjects}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No public projects match your criteria."
        />
      </Card>
    </div>
  );
};
