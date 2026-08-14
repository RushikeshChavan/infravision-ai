import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  Lightbulb,
} from "lucide-react";
import { ProjectRiskAnalysis } from "../utils/riskEngine";
import { RiskBadge } from "./RiskBadge";
import { Card } from "./Card";

export interface RiskAnalysisCardProps {
  analysis: ProjectRiskAnalysis;
  projectCode?: string;
  className?: string;
}

export const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({
  analysis,
  projectCode,
  className = "",
}) => {
  const isAtRisk = analysis.riskLevel === "At Risk";
  const isNeedsAttention = analysis.riskLevel === "Needs Attention";

  const cardBorderColor = isAtRisk
    ? "var(--color-danger)"
    : isNeedsAttention
    ? "var(--color-warning)"
    : "var(--color-success)";

  const cardBgColor = isAtRisk
    ? "var(--color-danger-bg)"
    : isNeedsAttention
    ? "var(--color-warning-bg)"
    : "var(--color-success-bg)";

  return (
    <Card
      className={className}
      style={{
        borderLeft: `4px solid ${cardBorderColor}`,
      }}
    >
      {/* Title & Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              backgroundColor: cardBgColor,
              color: cardBorderColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                Intelligent Rule-Based Risk Analysis
              </h4>
              {projectCode && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  [{projectCode}]
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>
              Deterministic evaluation of schedule elapsed, physical completion, and budget burn
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <RiskBadge riskLevel={analysis.riskLevel} />
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            Risk Index: {analysis.riskScore}/100
          </span>
        </div>
      </div>

      {/* Comparative Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Timeline Elapsed
          </span>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            {analysis.metrics.scheduleElapsedPct}%
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Physical Progress
          </span>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)" }}>
            {analysis.metrics.completionPct}%
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Budget Utilized
          </span>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            {analysis.metrics.budgetUtilizationPct}%
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Schedule Lag Gap
          </span>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: analysis.metrics.scheduleDiscrepancyPct > 15 ? "var(--color-danger)" : "var(--color-success)",
            }}
          >
            {analysis.metrics.scheduleDiscrepancyPct > 0 ? `+${analysis.metrics.scheduleDiscrepancyPct}%` : "0%"}
          </div>
        </div>
      </div>

      {/* Trigger Reasons */}
      <div style={{ marginBottom: "14px" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>
          Observed Risk Factors:
        </span>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem" }}>
          {analysis.reasons.map((reason, idx) => (
            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "var(--color-text-secondary)" }}>
              <span style={{ color: cardBorderColor, fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Interventions */}
      {analysis.recommendedActions.length > 0 && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--color-border)",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "4px" }}>
            <Lightbulb size={14} color="var(--color-accent)" />
            <span>Recommended Administrative Interventions:</span>
          </div>
          <ul style={{ listStyle: "none", paddingLeft: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {analysis.recommendedActions.map((act, idx) => (
              <li key={idx} style={{ color: "var(--color-text-secondary)" }}>
                → {act}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
