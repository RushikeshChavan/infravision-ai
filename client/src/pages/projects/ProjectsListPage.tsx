import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Search, Filter, MapPin, ArrowUpRight } from "lucide-react";
import { Project, USER_ROLES } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { Table, Column } from "../../components/Table";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatCurrency, formatDate, getName } from "../../utils/formatters";

export const ProjectsListPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const isAdmin =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN;

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjectsApi();
      setProjects(response.projects || []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects by search, status, and department
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (project.location && project.location.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    const matchesDept = deptFilter === "ALL" || project.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Extract unique departments for filter dropdown
  const departments = Array.from(new Set(projects.map((p) => p.department).filter(Boolean)));

  const columns: Column<Project>[] = [
    {
      header: "Code",
      accessor: "projectCode",
      cell: (row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-primary)" }}>
          {row.projectCode}
        </span>
      ),
      width: "120px",
    },
    {
      header: "Project Details",
      accessor: "name",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{row.name}</div>
          {row.location && (
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
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
      cell: (row) => <span>{row.department}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <Badge status={row.status} dot />,
      width: "120px",
    },
    {
      header: "Project Manager",
      accessor: (row) => getName(row.projectManager),
      cell: (row) => (
        <span style={{ fontSize: "0.85rem" }}>
          {getName(row.projectManager, "Unassigned")}
        </span>
      ),
    },
    {
      header: "Budget",
      accessor: "totalBudget",
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(row.totalBudget)}</span>
      ),
      align: "right",
      width: "130px",
    },
    {
      header: "Action",
      cell: (row) => (
        <Link to={`/projects/${row._id}`}>
          <Button variant="outline" size="sm">
            <span>Details</span>
            <ArrowUpRight size={14} />
          </Button>
        </Link>
      ),
      align: "right",
      width: "100px",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Infrastructure Projects Directory</h1>
          <p>Complete register of government civil, transport, and energy infrastructure</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" onClick={fetchProjects} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProjects} className="mb-6" />}

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            alignItems: "flex-end",
          }}
        >
          <Input
            label="Search Projects"
            placeholder="Search by code, title, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />

          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>

          <Select
            label="Filter by Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Projects Table */}
      <Card noPadding>
        <Table
          columns={columns}
          data={filteredProjects}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No matching infrastructure projects found."
        />
      </Card>
    </div>
  );
};
