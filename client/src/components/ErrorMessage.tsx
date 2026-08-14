import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div className={`alert alert-danger ${className}`.trim()} role="alert">
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: "inherit", fontWeight: 500 }}>{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          style={{ borderColor: "currentColor", color: "inherit" }}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
