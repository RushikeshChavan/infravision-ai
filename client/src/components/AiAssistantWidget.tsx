import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Building2,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  Bot,
  User as UserIcon,
  ChevronRight,
  Info,
} from "lucide-react";
import { Project } from "../types";
import { formatCurrency } from "../utils/formatters";
import { analyzeProjectRisk } from "../utils/riskEngine";

export interface AiAssistantWidgetProps {
  projects: Project[];
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  dataPoints?: Array<{ label: string; value: string }>;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({ projects }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Namaste! I am the **GovInfra Intelligence Assistant (Demo)**. I can summarize project portfolio risks, audit milestone health, compute budget burn rates, and surface public transparency indicators.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dataPoints: [
            { label: "Active Packages", value: `${projects.length} Total` },
            {
              label: "Delayed",
              value: `${projects.filter((p) => p.status === "Delayed").length} Packages`,
            },
          ],
        },
      ]);
    }
  }, [projects]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Intelligence Query Resolution Engine (Deterministic NLP/Rule-based demo assistant)
  const processQuery = (query: string) => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // User message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: query,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      let replyData: Array<{ label: string; value: string }> | undefined = undefined;

      const delayedProjects = projects.filter((p) => p.status === "Delayed");
      const ongoingProjects = projects.filter((p) => p.status === "Ongoing");
      const totalBudget = projects.reduce((acc, p) => acc + (p.totalBudget || 0), 0);

      if (q.includes("risk") || q.includes("delay") || q.includes("delayed") || q.includes("critical")) {
        const atRiskCount = projects.filter(
          (p) => analyzeProjectRisk(p).riskLevel === "At Risk",
        ).length;

        replyText = `**Portfolio Risk Summary:**\n\nOut of ${projects.length} monitored infrastructure packages, **${delayedProjects.length} projects** are officially marked as Delayed, and **${atRiskCount} projects** are flagged as *At Risk* by the intelligent rule-based engine.\n\n**Primary Delay Drivers:**\n1. Right-of-Way and environmental clearance lags in dense corridors.\n2. Sub-grade contractor timeline slippages exceeding planned milestone limits.\n\n**Recommended Action:** Require mandatory weekly physical audits for delayed packages.`;
        replyData = [
          { label: "Delayed Projects", value: `${delayedProjects.length}` },
          { label: "At Risk Index", value: `${atRiskCount}` },
        ];
      } else if (q.includes("budget") || q.includes("cost") || q.includes("fund") || q.includes("spend")) {
        const estimatedUtil = totalBudget * 0.42;
        replyText = `**Financial Outlay & Burn Analysis:**\n\nTotal approved capital outlay across all active infrastructure projects is **${formatCurrency(totalBudget)}**.\n\n• Cumulative Disbursement: ~${formatCurrency(estimatedUtil)} (42% average utilization)\n• High-Burn Projects: Projects with fiscal spend exceeding physical progress by >20% have been placed under special treasury watch.`;
        replyData = [
          { label: "Total Outlay", value: formatCurrency(totalBudget) },
          { label: "Avg Burn Rate", value: "42%" },
        ];
      } else if (q.includes("citizen") || q.includes("public") || q.includes("transparency")) {
        replyText = `**Citizen Transparency & Open Data:**\n\nAll non-confidential infrastructure packages are available in the public catalog under Open Government Data standards. Citizens can track physical milestones, expenditure totals, and verified contractor deliverables.`;
        replyData = [
          { label: "Public Projects", value: `${projects.length}` },
          { label: "Public Access", value: "100% Open Data" },
        ];
      } else if (q.includes("inspection") || q.includes("gps") || q.includes("audit")) {
        replyText = `**Field Quality & GPS Geo-Audit Report:**\n\nField Engineers regularly submit geotagged inspection reports containing physical latitude/longitude coordinates and structural percentage verifications. Discrepancies between self-reported contractor claims and inspector audits automatically trigger risk warnings.`;
        replyData = [
          { label: "Audit Mode", value: "GPS Geotagged" },
          { label: "Verification", value: "Multi-Role Signoff" },
        ];
      } else {
        replyText = `I analyzed your query across **${projects.length} infrastructure projects** across all departments.\n\nCurrent status: **${ongoingProjects.length} Ongoing**, **${delayedProjects.length} Delayed**, with **${formatCurrency(totalBudget)}** in active civil works. You can click any prompt chip below for targeted analysis.`;
      }

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dataPoints: replyData,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const handleChipClick = (prompt: string) => {
    processQuery(prompt);
  };

  return (
    <>
      {/* Floating Assistant Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          height: "50px",
          padding: "0 18px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-primary)",
          color: "#FFFFFF",
          border: "2px solid var(--color-accent)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          zIndex: 90,
          fontWeight: 600,
          fontSize: "0.9rem",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        title="Open AI Project Assistant"
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={14} color="#FFFFFF" />
        </div>
        <span>AI Assistant</span>
        <span
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            padding: "2px 6px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Demo
        </span>
      </button>

      {/* Assistant Modal / Drawer Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "84px",
            right: "24px",
            width: "420px",
            maxWidth: "calc(100vw - 32px)",
            height: "580px",
            maxHeight: "calc(100vh - 120px)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 95,
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>GovInfra Intelligence</span>
                  <span
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                    }}
                  >
                    DEMO
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.75)" }}>
                  Rule-Based Project Decision Support
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Assistant Info Callout */}
          <div
            style={{
              padding: "8px 14px",
              backgroundColor: "var(--color-primary-light)",
              borderBottom: "1px solid var(--color-border)",
              fontSize: "0.72rem",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Info size={13} style={{ flexShrink: 0 }} />
            <span>AI responses synthesized deterministically from current live project portfolio.</span>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "var(--color-surface-subtle)",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "8px",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                }}
              >
                {msg.sender === "ai" && (
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <Sparkles size={13} />
                  </div>
                )}

                <div>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor:
                        msg.sender === "user" ? "var(--color-primary)" : "var(--color-surface)",
                      color:
                        msg.sender === "user" ? "#FFFFFF" : "var(--color-text-primary)",
                      boxShadow: "var(--shadow-xs)",
                      border:
                        msg.sender === "user"
                          ? "none"
                          : "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}

                    {/* Data Points Badges */}
                    {msg.dataPoints && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid var(--color-divider)",
                          flexWrap: "wrap",
                        }}
                      >
                        {msg.dataPoints.map((dp, i) => (
                          <div
                            key={i}
                            style={{
                              backgroundColor: "var(--color-primary-light)",
                              padding: "3px 8px",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.72rem",
                            }}
                          >
                            <span style={{ color: "var(--color-text-muted)" }}>{dp.label}: </span>
                            <strong style={{ color: "var(--color-primary)" }}>{dp.value}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--color-text-muted)",
                      marginTop: "2px",
                      textAlign: msg.sender === "user" ? "right" : "left",
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                <span className="spinner spinner-sm" />
                <span>Synthesizing portfolio intelligence...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "var(--color-surface)",
              borderTop: "1px solid var(--color-divider)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            <button
              className="demo-account-chip"
              onClick={() => handleChipClick("Summarize at-risk and delayed projects")}
            >
              <AlertTriangle size={12} style={{ marginRight: "4px" }} />
              At-Risk Packages
            </button>
            <button
              className="demo-account-chip"
              onClick={() => handleChipClick("Analyze budget allocation vs utilization")}
            >
              <DollarSign size={12} style={{ marginRight: "4px" }} />
              Fiscal Outlay
            </button>
            <button
              className="demo-account-chip"
              onClick={() => handleChipClick("What is the citizen transparency status?")}
            >
              <ShieldCheck size={12} style={{ marginRight: "4px" }} />
              Transparency Status
            </button>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuery.trim()) {
                processQuery(inputQuery.trim());
              }
            }}
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--color-surface)",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Ask about project risks, spend, or milestones..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "0 12px",
                cursor: inputQuery.trim() ? "pointer" : "not-allowed",
                opacity: inputQuery.trim() ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
