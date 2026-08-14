import React, { useEffect, useState } from "react";
import { FileText, Plus, Download, Shield, ExternalLink, Trash2 } from "lucide-react";
import { Project, DocumentItem, USER_ROLES } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { getDocumentsByProjectApi, createDocumentApi } from "../../api/documents";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { Table, Column } from "../../components/Table";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatDate, getName } from "../../utils/formatters";

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState("Contract");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("https://infravision.gov.in/docs/sample-spec.pdf");
  const [classification, setClassification] = useState("INTERNAL");
  const [description, setDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const canUpload =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN ||
    user?.role === USER_ROLES.PROJECT_MANAGER ||
    user?.role === USER_ROLES.FIELD_ENGINEER ||
    user?.role === USER_ROLES.CONTRACTOR;

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

  const fetchDocuments = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getDocumentsByProjectApi(projId);
      setDocuments(response.documents || []);
    } catch (err: any) {
      setError(err.message || "Failed to load project documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchDocuments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fileName.trim() || !fileUrl.trim()) {
      setError("File name and Document URL are required.");
      return;
    }

    setCreateLoading(true);
    try {
      await createDocumentApi({
        project: selectedProjectId,
        documentType: documentType as any,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        classification: classification as any,
        description: description.trim() || undefined,
      });

      setModalOpen(false);
      setFileName("");
      setDescription("");
      fetchDocuments(selectedProjectId);
    } catch (err: any) {
      setError(err.message || "Failed to upload document metadata.");
    } finally {
      setCreateLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const columns: Column<DocumentItem>[] = [
    {
      header: "Document Name",
      accessor: "fileName",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{row.fileName}</div>
            {row.description && (
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {row.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "documentType",
      cell: (row) => (
        <span
          style={{
            fontSize: "0.82rem",
            backgroundColor: "var(--color-surface-subtle)",
            padding: "3px 8px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
          }}
        >
          {row.documentType}
        </span>
      ),
      width: "140px",
    },
    {
      header: "Security Level",
      accessor: "classification",
      cell: (row) => {
        const cls = row.classification;
        const color = cls === "PUBLIC" ? "green" : cls === "INTERNAL" ? "blue" : "red";
        return (
          <Badge variant={color as any}>
            {cls}
          </Badge>
        );
      },
      width: "130px",
    },
    {
      header: "Uploaded At",
      accessor: "uploadedAt",
      cell: (row) => <span>{formatDate(row.uploadedAt)}</span>,
      width: "120px",
    },
    {
      header: "Action",
      cell: (row) => (
        <a
          href={row.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Button variant="outline" size="sm">
            <span>Open</span>
            <ExternalLink size={13} />
          </Button>
        </a>
      ),
      align: "right",
      width: "100px",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Document & Records Repository</h1>
          <p>Contracts, engineering estimates, environmental approvals, and completion certificates</p>
        </div>
        <div className="page-actions">
          {canUpload && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
              disabled={!selectedProjectId}
            >
              Upload Document Record
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchDocuments(selectedProjectId)} className="mb-6" />}

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

      {/* Documents Table */}
      <Card
        title={`Project Documentation: ${selectedProject?.name || "Project"}`}
        subtitle={`${documents.length} registered official documents`}
        noPadding
      >
        <Table
          columns={columns}
          data={documents}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No documents cataloged for this project. Use 'Upload Document Record' to archive records."
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Register Document — ${selectedProject?.projectCode || ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createLoading}
              onClick={handleCreateDocument}
            >
              Save Document Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDocument}>
          <Input
            label="Document File Name / Title"
            placeholder="e.g. Approved Structural Blueprint Rev 3.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
          />

          <div className="grid-2">
            <Select
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="Contract">Contract</option>
              <option value="Approval">Approval</option>
              <option value="Estimate">Estimate</option>
              <option value="Invoice">Invoice</option>
              <option value="Progress Report">Progress Report</option>
              <option value="Completion Report">Completion Report</option>
              <option value="Other">Other</option>
            </Select>

            <Select
              label="Access Classification"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              <option value="PUBLIC">PUBLIC (Visible to Citizens)</option>
              <option value="INTERNAL">INTERNAL (Contractors & Officials)</option>
              <option value="RESTRICTED">RESTRICTED (Officials & PMs)</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL (Admins & Auditors)</option>
            </Select>
          </div>

          <Input
            label="File Storage URL / Reference"
            placeholder="https://storage.infravision.gov/..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
          />

          <Input
            label="Description / Remarks"
            placeholder="e.g. Signed contract between PWD and contractor"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
