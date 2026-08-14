import React, { useEffect, useState } from "react";
import { DollarSign, Plus, TrendingUp, PieChart, AlertCircle } from "lucide-react";
import { Project, Budget, USER_ROLES } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { getBudgetsByProjectApi, createBudgetApi } from "../../api/budgets";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Card } from "../../components/Card";
import { StatCard } from "../../components/StatCard";
import { Modal } from "../../components/Modal";
import { Table, Column } from "../../components/Table";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatCurrency, getName } from "../../utils/formatters";

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState("Civil Construction");
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [utilizedAmount, setUtilizedAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const isAdmin =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN;

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

  const fetchBudgets = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getBudgetsByProjectApi(projId);
      setBudgets(response.budgets || []);
    } catch (err: any) {
      setError(err.message || "Failed to load budget items for selected project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchBudgets(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const alloc = parseFloat(allocatedAmount);
    if (isNaN(alloc) || alloc <= 0) {
      setError("Please enter a valid allocated amount greater than zero.");
      return;
    }

    setCreateLoading(true);
    try {
      await createBudgetApi({
        project: selectedProjectId,
        category,
        allocatedAmount: alloc,
        utilizedAmount: parseFloat(utilizedAmount) || 0,
        description: description.trim() || undefined,
      });

      setModalOpen(false);
      setAllocatedAmount("");
      setUtilizedAmount("0");
      setDescription("");
      fetchBudgets(selectedProjectId);
    } catch (err: any) {
      setError(err.message || "Failed to create budget entry.");
    } finally {
      setCreateLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
  const totalUtilized = budgets.reduce((acc, b) => acc + (b.utilizedAmount || 0), 0);
  const totalRemaining = budgets.reduce((acc, b) => acc + (b.remainingAmount || 0), 0);

  const columns: Column<Budget>[] = [
    {
      header: "Expenditure Category",
      accessor: "category",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.category}</div>
          {row.description && (
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Allocated",
      accessor: "allocatedAmount",
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(row.allocatedAmount)}</span>
      ),
      align: "right",
    },
    {
      header: "Utilized",
      accessor: "utilizedAmount",
      cell: (row) => (
        <span style={{ color: "var(--color-info-text)", fontWeight: 500 }}>
          {formatCurrency(row.utilizedAmount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Remaining",
      accessor: "remainingAmount",
      cell: (row) => (
        <span style={{ color: "var(--color-success-text)", fontWeight: 600 }}>
          {formatCurrency(row.remainingAmount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Burn Rate",
      cell: (row) => {
        const rate =
          row.allocatedAmount > 0
            ? Math.round((row.utilizedAmount / row.allocatedAmount) * 100)
            : 0;
        return (
          <div style={{ minWidth: "100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "3px" }}>
              <span>{rate}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className={`progress-bar-fill ${rate > 90 ? "fill-red" : rate > 60 ? "fill-amber" : "fill-green"}`}
                style={{ width: `${Math.min(100, rate)}%` }}
              />
            </div>
          </div>
        );
      },
      width: "140px",
    },
    {
      header: "Authorized By",
      accessor: (row) => getName(row.lastUpdatedBy),
      cell: (row) => (
        <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          {getName(row.lastUpdatedBy, "Department Officer")}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Budget Allocation & Fiscal Auditing</h1>
          <p>Line-item fund distribution, actual disbursement, and treasury burn rate</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
              disabled={!selectedProjectId}
            >
              Add Budget Line Item
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchBudgets(selectedProjectId)} className="mb-6" />}

      {/* Project Selector Bar */}
      <Card className="mb-6">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ minWidth: "300px", flex: 1 }}>
            <Select
              label="Select Infrastructure Project to Inspect"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.projectCode}] {p.name} ({p.department})
                </option>
              ))}
            </Select>
          </div>
          {selectedProject && (
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <div>
                <span className="text-muted text-xs">Total Project Budget:</span>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {formatCurrency(selectedProject.totalBudget)}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid-3 mb-6">
        <StatCard
          label="Total Allocated Line Items"
          value={formatCurrency(totalAllocated)}
          subtext={`For ${selectedProject?.name || "Selected Project"}`}
          icon={<DollarSign size={22} />}
          accent="blue"
        />
        <StatCard
          label="Disbursed & Utilized"
          value={formatCurrency(totalUtilized)}
          subtext={`${totalAllocated > 0 ? Math.round((totalUtilized / totalAllocated) * 100) : 0}% of line items disbursed`}
          icon={<TrendingUp size={22} />}
          accent="amber"
        />
        <StatCard
          label="Remaining Balance"
          value={formatCurrency(totalRemaining)}
          subtext="Available for forthcoming milestones"
          icon={<PieChart size={22} />}
          accent="green"
        />
      </div>

      {/* Budget Table */}
      <Card
        title={`Line Items: ${selectedProject?.name || "Project"}`}
        subtitle="Departmental head allocations and invoices"
        noPadding
      >
        <Table
          columns={columns}
          data={budgets}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No budget line items registered for this project yet. Use 'Add Budget Line Item' to distribute funds."
        />
      </Card>

      {/* Create Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Allocate Budget — ${selectedProject?.projectCode || ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createLoading}
              onClick={handleCreateBudget}
            >
              Allocate Funds
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBudget}>
          <Select
            label="Expenditure Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Civil Construction">Civil Construction</option>
            <option value="Land Acquisition">Land Acquisition</option>
            <option value="Raw Materials & Concrete">Raw Materials & Concrete</option>
            <option value="Labor & Equipment">Labor & Equipment</option>
            <option value="Engineering Consultation">Engineering Consultation</option>
            <option value="Environmental Clearance">Environmental Clearance</option>
            <option value="Contingency Fund">Contingency Fund</option>
          </Select>

          <Input
            label="Allocated Amount (₹ INR)"
            type="number"
            min="0"
            step="1000"
            placeholder="e.g. 5000000"
            value={allocatedAmount}
            onChange={(e) => setAllocatedAmount(e.target.value)}
            required
          />

          <Input
            label="Initial Utilized Amount (₹ INR)"
            type="number"
            min="0"
            step="1000"
            placeholder="0"
            value={utilizedAmount}
            onChange={(e) => setUtilizedAmount(e.target.value)}
          />

          <Input
            label="Description / Purpose"
            placeholder="e.g. Foundation piling and seismic structural reinforcement"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
