import { Project, Milestone, Budget, Inspection } from "../types";

export type RiskLevel = "On Track" | "Needs Attention" | "At Risk";

export interface ProjectRiskAnalysis {
  riskLevel: RiskLevel;
  riskScore: number; // 0 (no risk) to 100 (critical risk)
  badgeVariant: "success" | "warning" | "danger";
  reasons: string[];
  recommendedActions: string[];
  metrics: {
    scheduleElapsedPct: number;
    completionPct: number;
    budgetUtilizationPct: number;
    scheduleDiscrepancyPct: number;
  };
}

/**
 * Evaluates a project using deterministic, explainable rule-based logic:
 * 1. Delayed Status Flag
 * 2. Schedule Elapsed % vs Physical Progress % Discrepancy
 * 3. Budget Utilization % vs Physical Completion %
 * 4. Milestone Schedule Overdue Status
 * 5. Inspection Failures
 */
export function analyzeProjectRisk(
  project: Project,
  milestones: Milestone[] = [],
  budgets: Budget[] = [],
  inspections: Inspection[] = [],
): ProjectRiskAnalysis {
  const reasons: string[] = [];
  const recommendedActions: string[] = [];
  let riskScore = 0;

  // 1. Status Analysis
  if (project.status === "Delayed") {
    riskScore += 45;
    reasons.push("Official project status is classified as Delayed.");
    recommendedActions.push("Convene emergency departmental review with assigned contractor.");
  } else if (project.status === "Cancelled") {
    riskScore += 80;
    reasons.push("Project execution has been terminated or suspended.");
  }

  // 2. Schedule & Timeline Analysis
  let scheduleElapsedPct = 0;
  if (project.plannedStartDate && project.plannedEndDate) {
    const start = new Date(project.plannedStartDate).getTime();
    const end = new Date(project.plannedEndDate).getTime();
    const now = Date.now();

    if (end > start) {
      const totalDuration = end - start;
      const elapsed = Math.max(0, now - start);
      scheduleElapsedPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    }
  } else {
    // Default estimate if dates omitted
    scheduleElapsedPct = project.status === "Completed" ? 100 : project.status === "Ongoing" ? 60 : 10;
  }

  // Derive completion percentage from milestones or project status
  let completionPct = 0;
  if (milestones.length > 0) {
    const totalMilestonePct = milestones.reduce((acc, m) => acc + (m.completionPercentage || 0), 0);
    completionPct = Math.round(totalMilestonePct / milestones.length);
  } else {
    completionPct = project.status === "Completed" ? 100 : project.status === "Ongoing" ? 45 : 0;
  }

  // Schedule vs Completion Gap
  const scheduleDiscrepancyPct = scheduleElapsedPct - completionPct;
  if (scheduleDiscrepancyPct > 30 && project.status !== "Completed") {
    riskScore += 35;
    reasons.push(
      `Schedule slippage detected: ${scheduleElapsedPct}% of planned timeline has elapsed, but physical progress is only ${completionPct}% (${scheduleDiscrepancyPct}% lag).`,
    );
    recommendedActions.push("Issue formal milestone acceleration notice to contractor.");
  } else if (scheduleDiscrepancyPct > 15 && project.status !== "Completed") {
    riskScore += 20;
    reasons.push(
      `Minor timeline lag: Schedule elapsed (${scheduleElapsedPct}%) exceeds physical progress (${completionPct}%).`,
    );
    recommendedActions.push("Increase frequency of on-site field verification audits.");
  }

  // 3. Fiscal & Budget Utilization Analysis
  let totalAllocated = 0;
  let totalUtilized = 0;
  if (budgets.length > 0) {
    totalAllocated = budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
    totalUtilized = budgets.reduce((acc, b) => acc + (b.utilizedAmount || 0), 0);
  } else if (project.totalBudget) {
    totalAllocated = project.totalBudget;
    // Derive estimated spend if line-items not fetched
    totalUtilized = project.status === "Completed" ? totalAllocated : totalAllocated * (completionPct > 50 ? 0.65 : 0.40);
  }

  const budgetUtilizationPct =
    totalAllocated > 0 ? Math.round((totalUtilized / totalAllocated) * 100) : 0;

  if (budgetUtilizationPct > completionPct + 25 && project.status !== "Completed") {
    riskScore += 30;
    reasons.push(
      `High budget burn rate: ${budgetUtilizationPct}% of budget utilized, but only ${completionPct}% physical deliverables completed.`,
    );
    recommendedActions.push("Withhold pending contractor disbursements pending independent quantity audit.");
  } else if (budgetUtilizationPct > 90 && completionPct < 75 && project.status !== "Completed") {
    riskScore += 25;
    reasons.push(
      `Budget exhaustion risk: ${budgetUtilizationPct}% of funds utilized with significant work outstanding.`,
    );
    recommendedActions.push("Review line-item contingencies and contract variation requests.");
  }

  // 4. Milestone-Specific Checks
  const overdueMilestones = milestones.filter((m) => {
    if (m.status === "Completed") return false;
    if (!m.plannedDate) return false;
    return new Date(m.plannedDate).getTime() < Date.now();
  });

  if (overdueMilestones.length > 0) {
    riskScore += 20;
    reasons.push(
      `${overdueMilestones.length} milestone deliverable(s) are overdue past their planned target dates.`,
    );
  }

  // 5. Field Inspection Quality Checks
  const failedInspections = inspections.filter((i) => i.status === "Failed");
  if (failedInspections.length > 0) {
    riskScore += 25;
    reasons.push(
      `Field compliance alert: ${failedInspections.length} on-site inspection(s) failed structural/safety verification.`,
    );
    recommendedActions.push("Conduct mandatory remedial re-inspection before continuing superstructure works.");
  }

  // Determine Final Risk Level
  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel: RiskLevel = "On Track";
  let badgeVariant: "success" | "warning" | "danger" = "success";

  if (riskScore >= 50 || project.status === "Delayed") {
    riskLevel = "At Risk";
    badgeVariant = "danger";
  } else if (riskScore >= 25) {
    riskLevel = "Needs Attention";
    badgeVariant = "warning";
  } else {
    riskLevel = "On Track";
    badgeVariant = "success";
    if (reasons.length === 0) {
      reasons.push("Project execution, milestone cadence, and fiscal disbursements are within nominal parameters.");
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push("Maintain standard bi-weekly milestone inspection schedule.");
    }
  }

  return {
    riskLevel,
    riskScore,
    badgeVariant,
    reasons,
    recommendedActions,
    metrics: {
      scheduleElapsedPct,
      completionPct,
      budgetUtilizationPct,
      scheduleDiscrepancyPct,
    },
  };
}
