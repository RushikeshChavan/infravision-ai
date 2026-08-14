import React, { useEffect, useState } from "react";
import { ClipboardCheck, Plus, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Project, Inspection, USER_ROLES } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { getInspectionsByProjectApi, createInspectionApi } from "../../api/inspections";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { Table, Column } from "../../components/Table";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatDate, getName } from "../../utils/formatters";

export const InspectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState("28.6139");
  const [longitude, setLongitude] = useState("77.2090");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Completed");
  const [completionPercentage, setCompletionPercentage] = useState("75");
  const [createLoading, setCreateLoading] = useState(false);

  const canInspect =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN ||
    user?.role === USER_ROLES.PROJECT_MANAGER ||
    user?.role === USER_ROLES.FIELD_ENGINEER;

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

  const fetchInspections = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getInspectionsByProjectApi(projId);
      setInspections(response.inspections || []);
    } catch (err: any) {
      setError(err.message || "Failed to load project inspection reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchInspections(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setCreateLoading(true);
    try {
      await createInspectionApi({
        project: selectedProjectId,
        inspectionDate,
        latitude: parseFloat(latitude) || undefined,
        longitude: parseFloat(longitude) || undefined,
        remarks: remarks.trim() || undefined,
        status: status as any,
        completionPercentage: parseInt(completionPercentage, 10) || 0,
      });

      setModalOpen(false);
      setRemarks("");
      fetchInspections(selectedProjectId);
    } catch (err: any) {
      setError(err.message || "Failed to submit inspection report.");
    } finally {
      setCreateLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const columns: Column<Inspection>[] = [
    {
      header: "Inspection Date",
      accessor: "inspectionDate",
      cell: (row) => <span>{formatDate(row.inspectionDate)}</span>,
      width: "130px",
    },
    {
      header: "Field Inspector",
      accessor: (row) => getName(row.inspector),
      cell: (row) => (
        <span style={{ fontWeight: 500 }}>{getName(row.inspector, "Inspector")}</span>
      ),
    },
    {
      header: "GPS Location Coordinates",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
          <MapPin size={13} color="var(--color-accent)" />
          <span>{row.latitude?.toFixed(4) || "28.6139"}°N, {row.longitude?.toFixed(4) || "77.2090"}°E</span>
        </div>
      ),
    },
    {
      header: "On-Ground Progress",
      accessor: "completionPercentage",
      cell: (row) => <strong style={{ color: "var(--color-primary)" }}>{row.completionPercentage}%</strong>,
      width: "140px",
    },
    {
      header: "Inspection Status",
      accessor: "status",
      cell: (row) => <Badge status={row.status} dot />,
      width: "130px",
    },
    {
      header: "Remarks / Field Log",
      accessor: "remarks",
      cell: (row) => (
        <span style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
          {row.remarks || "Standard inspection completed."}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Field Inspections & GPS Audit Log</h1>
          <p>On-site civil audits, geotagged physical progress verification, and inspection history</p>
        </div>
        <div className="page-actions">
          {canInspect && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
              disabled={!selectedProjectId}
            >
              Log Field Inspection
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchInspections(selectedProjectId)} className="mb-6" />}

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

      {/* Inspections Table */}
      <Card
        title={`Audit History: ${selectedProject?.name || "Project"}`}
        subtitle={`${inspections.length} submitted field reports`}
        noPadding
      >
        <Table
          columns={columns}
          data={inspections}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No on-site inspections recorded for this project yet. Use 'Log Field Inspection' to submit a report."
        />
      </Card>

      {/* Log Inspection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Log On-Site Inspection — ${selectedProject?.projectCode || ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createLoading}
              onClick={handleCreateInspection}
            >
              Submit Audit Report
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateInspection}>
          <Input
            label="Inspection Date"
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            required
          />

          <div className="grid-2">
            <Input
              label="Site Latitude"
              placeholder="e.g. 28.6139"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />

            <Input
              label="Site Longitude"
              placeholder="e.g. 77.2090"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <Input
              label="Verified Completion Percentage (%)"
              type="number"
              min="0"
              max="100"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(e.target.value)}
            />

            <Select
              label="Inspection Result"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Completed">Passed / Completed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Failed">Failed / Non-Compliant</option>
            </Select>
          </div>

          <Input
            label="Audit Remarks & Physical Evidence Notes"
            placeholder="e.g. Structural concrete curing completed satisfactorily. Quality check passed."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
