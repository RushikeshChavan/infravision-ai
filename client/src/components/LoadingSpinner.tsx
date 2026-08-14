import React from "react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  fullPage = false,
}) => {
  const spinnerClass = size === "md" ? "spinner" : `spinner spinner-${size}`;

  if (fullPage) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--color-bg)",
          gap: "16px",
        }}
      >
        <div className="spinner spinner-lg" />
        {text && <p className="text-muted font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={spinnerClass} />
      {text && <p className="text-muted text-sm">{text}</p>}
    </div>
  );
};
