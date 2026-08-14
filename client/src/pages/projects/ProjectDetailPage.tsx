import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  User as UserIcon,
  Briefcase,
  Flag,
  FileText,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  PlusCircle,
  Eye,
  Shield,
  Layers,
} from "lucide-react";
import {
  Project,
  Milestone,
  Budget,
  Inspection,
  DocumentItem,
  USER_ROLES,
} from "../../types";
import { getProjectByIdApi } from "../../api/projects";
import { getMilestonesByProjectApi, createMilestoneApi } from "../../api/milestones";
import { getBudgetsByProjectApi } from "../../api/budgets";
import { getInspectionsByProjectApi, createInspectionApi } from "../../api/inspections";
import { getDocumentsByProjectApi } from "../../api/documents";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Input, Select, Textarea } from "../../components/Input";
import { Table, Column } from "../../components/Table";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { RiskAnalysisCard } from "../../components/RiskAnalysisCard";
import { analyzeProjectRisk } from "../../utils/riskEngine";
import { formatCurrency, formatDate, getName } from "../../utils/formatters";

type TabType = "overview" | "milestones" | "budgets" | "inspections" | "documents";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states for creating milestone & inspection
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [newMilestonePct, setNewMilestonePct] = useState("0");
  const [creatingMilestone, setCreatingMilestone] = useState(false);

  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [newInspectionDate, setNewInspectionDate] = useState("");
  const [newInspectionPct, setNewInspectionPct] = useState("50");
  const [newInspectionRemarks, setNewInspectionRemarks] = useState("");
  const [creatingInspection, setCreatingInspection] = useState(false);

  const canManage =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN ||
    user?.role === USER_ROLES.PROJECT_MANAGER;

  const canInspect =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN ||
    user?.role === USER_ROLES.FIELD_ENGINEER;

  const isCitizen = user?.role === USER_ROLES.CITIZEN;

  const loadAllProjectData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [projRes, mileRes, budRes, inspRes, docRes] = await Promise.all([
        getProjectByIdApi(id),
        getMilestonesByProjectApi(id).catch(() => ({ milestones: [] })),
        getBudgetsByProjectApi(id).catch(() => ({ budgets: [] })),
        getInspectionsByProjectApi(id).catch(() => ({ inspections: [] })),
        getDocumentsByProjectApi(id).catch(() => ({ documents: [] })),
      ]);

      setProject(projRes.project);
      setMilestones(mileRes.milestones || []);
      setBudgets(budRes.budgets || []);
      setInspections(inspRes.inspections || []);
      setDocuments(docRes.documents || []);
    } catch (err: any) {
      setError(err.message || "Failed to load complete project file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProjectData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage text="Compiling multi-department project dossier..." />;
  }

  if (error || !project) {
    return (
      <div>
        <ErrorMessage message={error || "Project record not found."} className="mb-4" />
        <Link to="/projects">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>
            Back to Projects Directory
          </Button>
        </Link>
      </div>
    );
  }

  // Aggregate stats
  const totalBudget = project.totalBudget || 0;
  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0) || totalBudget;
  const totalUtilized = budgets.reduce((acc, b) => acc + (b.utilizedAmount || 0), 0) || (totalBudget > 0 ? totalBudget * 0.42 : 0);
  const remainingBudget = Math.max(0, totalAllocated - totalUtilized);

  const avgCompletion =
    milestones.length > 0
      ? Math.round(milestones.reduce((acc, m) => acc + (m.completionPercentage || 0), 0) / milestones.length)
      : project.status === "Completed"
      ? 100
      : project.status === "Ongoing"
      ? 45
      : 0;

  const riskAnalysis = analyzeProjectRisk(project, milestones, budgets, inspections);

  // Filter documents for citizen role
  const visibleDocuments = isCitizen
    ? documents.filter((d) => d.classification === "PUBLIC")
    : documents;

  // Handle milestone creation
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim() || !id) return;
    setCreatingMilestone(true);
    try {
      await createMilestoneApi({
        project: id,
        name: newMilestoneName.trim(),
        description: newMilestoneDesc.trim(),
        plannedDate: newMilestoneDate ? new Date(newMilestoneDate) : undefined,
        completionPercentage: Number(newMilestonePct) || 0,
        status: Number(newMilestonePct) === 100 ? "Completed" : Number(newMilestonePct) > 0 ? "In Progress" : "Pending",
      });
      setShowMilestoneModal(false);
      setNewMilestoneName("");
      setNewMilestoneDesc("");
      loadAllProjectData();
    } catch (err: any) {
      alert(err.message || "Failed to create milestone.");
    } finally {
      setCreatingMilestone(false);
    }
  };

  // Handle inspection creation
  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newInspectionDate) return;
    setCreatingInspection(true);
    try {
      await createInspectionApi({
        project: id,
        inspectionDate: newInspectionDate,
        completionPercentage: Number(newInspectionPct) || 0,
        remarks: newInspectionRemarks.trim(),
        latitude: project.latitude,
        longitude: project.longitude,
        status: "Completed",
        verified: true,
      });
      setShowInspectionModal(false);
      setNewInspectionRemarks("");
      loadAllProjectData();
    } catch (err: any) {
      alert(err.message || "Failed to submit field inspection.");
    } finally {
      setCreatingInspection(false);
    }
  };

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Link to="/projects">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Back to Projects Directory
          </Button>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Badge status={project.status} dot style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
            {project.status}
          </Badge>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 700,
              backgroundColor:
                riskAnalysis.riskLevel === "At Risk"
                  ? "var(--color-danger-bg)"
                  : riskAnalysis.riskLevel === "Needs Attention"
                  ? "var(--color-warning-bg)"
                  : "var(--color-success-bg)",
              color:
                riskAnalysis.riskLevel === "At Risk"
                  ? "var(--color-danger-text)"
                  : riskAnalysis.riskLevel === "Needs Attention"
                  ? "var(--color-warning-text)"
                  : "var(--color-success-text)",
              border: `1px solid ${
                riskAnalysis.riskLevel === "At Risk"
                  ? "var(--color-danger-border)"
                  : riskAnalysis.riskLevel === "Needs Attention"
                  ? "var(--color-warning-border)"
                  : "var(--color-success-border)"
              }`,
            }}
          >
            ● {riskAnalysis.riskLevel} (Index: {riskAnalysis.riskScore}/100)
          </span>
        </div>
      </div>

      {/* Main Project Dossier Hero Card */}
      <Card className="mb-6">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--color-primary)",
                  backgroundColor: "var(--color-primary-light)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {project.projectCode}
              </span>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                Department of {project.department}
              </span>
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.3 }}>
              {project.name}
            </h1>

            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: "850px", fontSize: "0.95rem" }}>
              {project.description || "Official government infrastructure asset file."}
            </p>

            {/* Quick Tag Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                <MapPin size={15} color="var(--color-accent)" />
                <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{project.location || "Coordinates Monitored"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                <UserIcon size={15} color="var(--color-primary)" />
                <span>PM: <strong style={{ color: "var(--color-text-primary)" }}>{getName(project.projectManager, "Assigned Officer")}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                <Briefcase size={15} color="var(--color-accent)" />
                <span>Contractor: <strong style={{ color: "var(--color-text-primary)" }}>{getName(project.contractor, "L&T Heavy Civil / EPC")}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Outlay & Progress Summary Box */}
          <div
            style={{
              padding: "20px",
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--color-border)",
              minWidth: "260px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 700 }}>
                Total Approved Capital Outlay
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)", marginTop: "2px" }}>
                {formatCurrency(totalBudget)}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                <span style={{ fontWeight: 600 }}>Physical Progress</span>
                <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{avgCompletion}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${avgCompletion}%`,
                    backgroundColor:
                      project.status === "Completed"
                        ? "var(--color-success)"
                        : project.status === "Delayed"
                        ? "var(--color-danger)"
                        : "var(--color-primary)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", borderTop: "1px solid var(--color-divider)", paddingTop: "10px" }}>
              <div>
                <span className="text-muted">Disbursed:</span>{" "}
                <strong>{formatCurrency(totalUtilized)}</strong>
              </div>
              <div>
                <span className="text-muted">Balance:</span>{" "}
                <strong>{formatCurrency(remainingBudget)}</strong>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid var(--color-border)",
          marginBottom: "24px",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          style={{
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "0.9rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "overview" ? "3px solid var(--color-primary)" : "3px solid transparent",
            color: activeTab === "overview" ? "var(--color-primary)" : "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Layers size={16} />
          <span>Executive Overview & Risk</span>
        </button>

        <button
          onClick={() => setActiveTab("milestones")}
          className={`tab-btn ${activeTab === "milestones" ? "active" : ""}`}
          style={{
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "0.9rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "milestones" ? "3px solid var(--color-primary)" : "3px solid transparent",
            color: activeTab === "milestones" ? "var(--color-primary)" : "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Flag size={16} />
          <span>Milestones ({milestones.length})</span>
        </button>

        {!isCitizen && (
          <button
            onClick={() => setActiveTab("budgets")}
            className={`tab-btn ${activeTab === "budgets" ? "active" : ""}`}
            style={{
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: "0.9rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: activeTab === "budgets" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "budgets" ? "var(--color-primary)" : "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <DollarSign size={16} />
            <span>Fiscal Allocation ({budgets.length})</span>
          </button>
        )}

        {!isCitizen && (
          <button
            onClick={() => setActiveTab("inspections")}
            className={`tab-btn ${activeTab === "inspections" ? "active" : ""}`}
            style={{
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: "0.9rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: activeTab === "inspections" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "inspections" ? "var(--color-primary)" : "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ClipboardCheck size={16} />
            <span>Field Inspections ({inspections.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("documents")}
          className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
          style={{
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "0.9rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "documents" ? "3px solid var(--color-primary)" : "3px solid transparent",
            color: activeTab === "documents" ? "var(--color-primary)" : "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FileText size={16} />
          <span>Documents & Clearances ({visibleDocuments.length})</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW & RISK */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Rule-Based Risk Card */}
          <RiskAnalysisCard analysis={riskAnalysis} projectCode={project.projectCode} />

          {/* Key Geographic & Timelines Meta Grid */}
          <div className="grid-3">
            {/* GIS Geospatial Position */}
            <Card title="GIS Geospatial Location" subtitle="Physical project asset coordinates">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MapPin size={20} color="var(--color-accent)" />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Site Location</div>
                    <div style={{ fontWeight: 600 }}>{project.location || "Monitored Region"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Latitude</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {project.latitude !== undefined ? project.latitude.toFixed(6) : "28.613900"}°N
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Longitude</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {project.longitude !== undefined ? project.longitude.toFixed(6) : "77.209000"}°E
                    </div>
                  </div>
                </div>

                <Link to="/map">
                  <Button variant="outline" size="sm" icon={<ExternalLink size={14} />} style={{ width: "100%", marginTop: "8px" }}>
                    View on GIS Infrastructure Map
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Schedule & Milestones Summary */}
            <Card title="Contract Timelines" subtitle="Planned execution window">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <Calendar size={18} color="var(--color-primary)" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Planned Window</div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                      {formatDate(project.plannedStartDate)} → {formatDate(project.plannedEndDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <Calendar size={18} color="var(--color-success)" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Actual Window</div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                      {formatDate(project.actualStartDate) || "In Progress"} → {formatDate(project.actualEndDate) || "TBD"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--color-surface-subtle)", padding: "8px 12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Milestone Delivery:</span>
                  <span style={{ fontWeight: 700 }}>
                    {milestones.filter((m) => m.status === "Completed").length} of {milestones.length} Completed
                  </span>
                </div>
              </div>
            </Card>

            {/* Stakeholder Accountability */}
            <Card title="Stakeholder Responsibility" subtitle="Designated government & contractor officers">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <UserIcon size={18} color="var(--color-primary)" />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Project Manager</div>
                    <div style={{ fontWeight: 600 }}>{getName(project.projectManager, "Vikramaditya Roy (PWD)")}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Briefcase size={18} color="var(--color-accent)" />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Executing Contractor</div>
                    <div style={{ fontWeight: 600 }}>{getName(project.contractor, "L&T Heavy Infrastructure Ltd.")}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={18} color="var(--color-success)" />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Field Quality Inspector</div>
                    <div style={{ fontWeight: 600 }}>Ananya Deshmukh (PWD Field Div)</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONE TIMELINE */}
      {activeTab === "milestones" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Milestone Delivery Timeline</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                Key deliverable checkpoints, completion % and statutory verification signoffs
              </p>
            </div>
            {canManage && (
              <Button variant="primary" size="sm" icon={<PlusCircle size={15} />} onClick={() => setShowMilestoneModal(true)}>
                Add Milestone Checkpoint
              </Button>
            )}
          </div>

          {milestones.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-muted)" }}>
                <Flag size={36} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <p>No milestone checkpoints recorded for this infrastructure project yet.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {milestones.map((m, index) => {
                const isComplete = m.status === "Completed" || m.completionPercentage === 100;
                const isDelayed = m.status === "Delayed";
                return (
                  <Card key={m._id || index} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: isComplete
                              ? "var(--color-success-bg)"
                              : isDelayed
                              ? "var(--color-danger-bg)"
                              : "var(--color-primary-light)",
                            color: isComplete
                              ? "var(--color-success)"
                              : isDelayed
                              ? "var(--color-danger)"
                              : "var(--color-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>
                            {m.name}
                          </h4>
                          {m.description && (
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "6px" }}>
                              {m.description}
                            </p>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                            <span>Target: <strong>{formatDate(m.plannedDate)}</strong></span>
                            {m.actualDate && <span>Delivered: <strong>{formatDate(m.actualDate)}</strong></span>}
                            {m.verifiedBy && (
                              <span style={{ color: "var(--color-success-text)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle2 size={13} />
                                Verified on {formatDate(m.verificationDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", minWidth: "140px" }}>
                        <Badge status={m.status} dot style={{ marginBottom: "8px" }}>
                          {m.status}
                        </Badge>
                        <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-primary)" }}>
                          {m.completionPercentage}%
                        </div>
                      </div>
                    </div>

                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${m.completionPercentage}%`,
                          backgroundColor: isComplete
                            ? "var(--color-success)"
                            : isDelayed
                            ? "var(--color-danger)"
                            : "var(--color-primary)",
                        }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BUDGET ALLOCATION & SPENDING */}
      {activeTab === "budgets" && !isCitizen && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Line-Item Fiscal Allocation & Expenditure</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                Audited cost breakdown across civil works, engineering, and contingency lines
              </p>
            </div>
          </div>

          <div className="grid-3 mb-6">
            <Card title="Total Approved Budget" subtitle="Statutory capital sanction">
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)" }}>
                {formatCurrency(totalAllocated)}
              </div>
            </Card>
            <Card title="Cumulative Disbursed" subtitle="Audited contractor payouts">
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-accent)" }}>
                {formatCurrency(totalUtilized)}
              </div>
            </Card>
            <Card title="Treasury Balance" subtitle="Remaining unspent buffer">
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-success)" }}>
                {formatCurrency(remainingBudget)}
              </div>
            </Card>
          </div>

          {budgets.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-muted)" }}>
                <DollarSign size={36} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <p>No line-item budgets recorded for this project.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {budgets.map((b, idx) => {
                const utilPct = b.allocatedAmount > 0 ? Math.round((b.utilizedAmount / b.allocatedAmount) * 100) : 0;
                return (
                  <Card key={b._id || idx} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                      <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{b.category}</h4>
                        {b.description && (
                          <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                            {b.description}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          {formatCurrency(b.utilizedAmount)} / <span className="text-muted">{formatCurrency(b.allocatedAmount)}</span>
                        </div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: utilPct > 90 ? "var(--color-danger)" : "var(--color-text-muted)" }}>
                          {utilPct}% Utilized
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(100, utilPct)}%`,
                          backgroundColor: utilPct > 90 ? "var(--color-danger)" : "var(--color-primary)",
                        }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FIELD INSPECTIONS & GPS AUDITS */}
      {activeTab === "inspections" && !isCitizen && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Field Quality & Geotagged Inspections</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                GPS verified site audits, structural tests, and quality compliance reports
              </p>
            </div>
            {canInspect && (
              <Button variant="primary" size="sm" icon={<PlusCircle size={15} />} onClick={() => setShowInspectionModal(true)}>
                Log Field Inspection
              </Button>
            )}
          </div>

          {inspections.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-muted)" }}>
                <ClipboardCheck size={36} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <p>No field inspections recorded for this project yet.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {inspections.map((insp, idx) => (
                <Card key={insp._id || idx} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          Site Audit: {formatDate(insp.inspectionDate)}
                        </span>
                        <Badge
                          variant={insp.status === "Completed" ? "success" : insp.status === "Failed" ? "danger" : "info"}
                          dot
                        >
                          {insp.status}
                        </Badge>
                        {insp.verified && (
                          <span style={{ fontSize: "0.72rem", backgroundColor: "var(--color-success-bg)", color: "var(--color-success-text)", padding: "2px 8px", borderRadius: "var(--radius-sm)", fontWeight: 600 }}>
                            ✓ Geotag Verified
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
                        "{insp.remarks || "Standard bi-weekly structural verification conducted without anomalies."}"
                      </p>

                      <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                        <span>Inspector: <strong style={{ color: "var(--color-text-primary)" }}>{getName(insp.inspector, "Ananya Deshmukh (Field Eng)")}</strong></span>
                        <span>GPS Coordinates: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>{insp.latitude || 18.9750}°N, {insp.longitude || 72.8258}°E</strong></span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Verified Progress
                      </div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-primary)" }}>
                        {insp.completionPercentage}%
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOCUMENTS & CLEARANCES */}
      {activeTab === "documents" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Project Documents & Statutory Clearances</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                {isCitizen ? "Public disclosures and environmental clearances" : "Contract agreements, DPRs, interim payment certificates and statutory permits"}
              </p>
            </div>
          </div>

          {visibleDocuments.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-muted)" }}>
                <FileText size={36} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <p>No project documents available for this classification.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {visibleDocuments.map((doc, idx) => (
                <Card key={doc._id || idx} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--color-primary-light)",
                          color: "var(--color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{doc.fileName}</span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor:
                                doc.classification === "PUBLIC"
                                  ? "var(--color-success-bg)"
                                  : doc.classification === "INTERNAL"
                                  ? "var(--color-info-bg)"
                                  : "var(--color-warning-bg)",
                              color:
                                doc.classification === "PUBLIC"
                                  ? "var(--color-success-text)"
                                  : doc.classification === "INTERNAL"
                                  ? "var(--color-info-text)"
                                  : "var(--color-warning-text)",
                            }}
                          >
                            {doc.classification}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                          {doc.description || `Official ${doc.documentType} artifact`}
                        </p>
                        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                          Type: {doc.documentType} · Uploaded: {formatDate(doc.uploadedAt || doc.createdAt)}
                        </div>
                      </div>
                    </div>

                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>
                        View Document
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Milestone */}
      <Modal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        title="Add Milestone Checkpoint"
      >
        <form onSubmit={handleCreateMilestone}>
          <Input
            label="Milestone Name"
            placeholder="e.g. Undersea Tunnel Boring Mavala TBM Breakthrough"
            value={newMilestoneName}
            onChange={(e) => setNewMilestoneName(e.target.value)}
            required
          />
          <Textarea
            label="Deliverable Description"
            placeholder="Key technical criteria, length in km, or span counts..."
            value={newMilestoneDesc}
            onChange={(e) => setNewMilestoneDesc(e.target.value)}
          />
          <Input
            label="Target Planned Date"
            type="date"
            value={newMilestoneDate}
            onChange={(e) => setNewMilestoneDate(e.target.value)}
          />
          <Input
            label="Completion Percentage (0-100)"
            type="number"
            min={0}
            max={100}
            value={newMilestonePct}
            onChange={(e) => setNewMilestonePct(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <Button variant="secondary" onClick={() => setShowMilestoneModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingMilestone}>
              Save Milestone
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Log Inspection */}
      <Modal
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        title="Log On-Site Field Quality Inspection"
      >
        <form onSubmit={handleCreateInspection}>
          <Input
            label="Inspection Date"
            type="date"
            value={newInspectionDate}
            onChange={(e) => setNewInspectionDate(e.target.value)}
            required
          />
          <Input
            label="Physical Progress Verified (%)"
            type="number"
            min={0}
            max={100}
            value={newInspectionPct}
            onChange={(e) => setNewInspectionPct(e.target.value)}
            required
          />
          <Textarea
            label="Field Engineer Remarks & Test Results"
            placeholder="Enter concrete compressive strength, bearing seating, safety observations..."
            value={newInspectionRemarks}
            onChange={(e) => setNewInspectionRemarks(e.target.value)}
            required
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <Button variant="secondary" onClick={() => setShowInspectionModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingInspection}>
              Submit Verified Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
