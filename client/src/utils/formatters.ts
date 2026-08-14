/**
 * Helper to safely extract an ID from a string or populated Mongoose object
 */
export function getId(entity: any): string {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || "";
}

/**
 * Helper to safely extract a name from a string or populated object
 */
export function getName(entity: any, fallback = "Unassigned"): string {
  if (!entity) return fallback;
  if (typeof entity === "string") return entity;
  return entity.name || entity.companyName || entity.email || fallback;
}

/**
 * Format currency in Indian Rupees (INR) or standard currency
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in readable format: e.g. 14 Aug 2026
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format date and time
 */
export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format percentage
 */
export function formatPercent(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) return "0%";
  return `${Math.min(100, Math.max(0, Math.round(value)))}%`;
}

/**
 * Get initials from full name
 */
export function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
