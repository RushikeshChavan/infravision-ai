import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "../../components/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary-light)",
          color: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "450px", marginBottom: "24px", fontSize: "0.95rem" }}>
        The infrastructure monitoring module or resource URL you requested does not exist or has been relocated.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/dashboard">
          <Button variant="primary" icon={<Home size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/projects">
          <Button variant="secondary">Browse Projects</Button>
        </Link>
      </div>
    </div>
  );
};
