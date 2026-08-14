import React, { useEffect, useState } from "react";
import { Flag, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Project, Milestone, USER_ROLES } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { getMilestonesByProjectApi, createMilestoneApi } from "../../api/milestones";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { Table, Column } from "../../components/Table";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatDate, getName } from "../../utils/formatters";

export const MilestonesPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState("0");
  const [status, setStatus] = useState("Pending");
  const [createLoading, setCreateLoading] = useState(false);

  const canCreate =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN ||
    user?.role === USER_ROLES.PROJECT_MANAGER;

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await getProjectsApi();
        const projs = response.projects || [];
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0]._id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load projects.");
      }
    }
    loadProjects();
  }, []);

  const fetchMilestones = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getMilestonesByProjectApi(projId);
      setMilestones(response.milestones || []);
    } catch (err: any) {
      setError(err.message || "Failed to load project milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchMilestones(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Milestone name is required.");
      return;
    }

    setCreateLoading(true);
    try {
      await createMilestoneApi({
        project: selectedProjectId,
        name: name.trim(),
        description: description.trim() || undefined,
        plannedDate: plannedDate ? plannedDate : undefined,
        completionPercentage: parseInt(completionPercentage, 10) || 0,
        status: status as any,
      });

      setModalOpen(false);
      setName("");
      setDescription("");
      setPlannedDate("");
      setCompletionPercentage("0");
      setStatus("Pending");
      fetchMilestones(selectedProjectId);
    } catch (err: any) {
      setError(err.message || "Failed to create milestone.");
    } finally {
      setCreateLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const columns: Column<Milestone>[] = [
    {
      header: "Milestone Deliverable",
      accessor: "name",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          {row.description && (
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Planned Target",
      accessor: "plannedDate",
      cell: (row) => <span>{formatDate(row.plannedDate)}</span>,
      width: "130px",
    },
    {
      header: "Progress %",
      accessor: "completionPercentage",
      cell: (row) => {
        const pct = row.completionPercentage || 0;
        return (
          <div style={{ minWidth: "110px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "3px" }}>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className={`progress-bar-fill ${pct === 100 ? "fill-green" : pct > 50 ? "" : "fill-amber"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
      width: "140px",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <Badge status={row.status} dot />,
      width: "120px",
    },
    {
      header: "Verified By",
      accessor: (row) => getName(row.verifiedBy),
      cell: (row) => (
        <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          {row.verifiedBy ? getName(row.verifiedBy) : "Pending Inspection"}
        </span>
      ),
      width: "150px",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Milestone Execution & Verification</h1>
          <p>Deliverable schedules, on-ground completion percentage, and inspector approvals</p>
        </div>
        <div className="page-actions">
          {canCreate && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
              disabled={!selectedProjectId}
            >
              Add Milestone Target
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchMilestones(selectedProjectId)} className="mb-6" />}

      {/* Project Selector */}
      <Card className="mb-6">
        <Select
          label="Select Infrastructure Project"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              [{p.projectCode}] {p.name}
            </option>
          ))}
        </Select>
      </Card>

      {/* Milestones Table */}
      <Card
        title={`Execution Schedule: ${selectedProject?.name || "Project"}`}
        subtitle={`${milestones.length} defined deliverables`}
        noPadding
      >
        <Table
          columns={columns}
          data={milestones}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No milestones recorded for this project. Use 'Add Milestone Target' to establish execution goals."
        />
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`New Milestone Target — ${selectedProject?.projectCode || ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createLoading}
              onClick={handleCreateMilestone}
            >
              Save Milestone
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateMilestone}>
          <Input
            label="Milestone Title"
            placeholder="e.g. Sub-grade excavation and foundation piling"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Planned Completion Date"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
          />

          <div className="grid-2">
            <Input
              label="Current Progress (%)"
              type="number"
              min="0"
              max="100"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(e.target.value)}
            />

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </Select>
          </div>

          <Input
            label="Deliverable Scope Description"
            placeholder="Scope details and technical parameters..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
