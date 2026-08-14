import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  className = "",
  ...props
}) => {
  const hasHeader = title || subtitle || action;

  return (
    <div className={`card ${className}`.trim()} {...props}>
      {hasHeader && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "card-body"}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
