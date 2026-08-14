import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={inputId}
            className={`form-label ${required ? "form-label-required" : ""}`}
          >
            {label}
          </label>
        )}
        <div className={leftIcon || rightIcon ? "input-with-icon" : ""}>
          {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`form-input ${error ? "has-error" : ""} ${className}`.trim()}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              className="input-icon-right"
              onClick={onRightIconClick}
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error ? (
          <span className="form-error-text">{error}</span>
        ) : helperText ? (
          <span className="form-helper">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, required, options, children, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={selectId}
            className={`form-label ${required ? "form-label-required" : ""}`}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`form-select ${error ? "has-error" : ""} ${className}`.trim()}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <span className="form-error-text">{error}</span>
        ) : helperText ? (
          <span className="form-helper">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, required, className = "", id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={textareaId}
            className={`form-label ${required ? "form-label-required" : ""}`}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`form-textarea ${error ? "has-error" : ""} ${className}`.trim()}
          rows={props.rows || 3}
          {...props}
        />
        {error ? (
          <span className="form-error-text">{error}</span>
        ) : helperText ? (
          <span className="form-helper">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
