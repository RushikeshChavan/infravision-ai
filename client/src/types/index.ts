export const USER_ROLES = {
  SUPER_ADMIN: "Super Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  PROJECT_MANAGER: "Project Manager",
  FIELD_ENGINEER: "Field Engineer",
  CONTRACTOR: "Contractor",
  AUDITOR: "Auditor",
  CITIZEN: "Citizen",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ProjectStatus =
  | "Planned"
  | "Ongoing"
  | "Delayed"
  | "Completed"
  | "Cancelled";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  projectCode: string;
  department: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  totalBudget?: number;
  status: ProjectStatus;
  projectManager: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role?: string;
  } | string;
  contractor?: {
    _id: string;
    id?: string;
    companyName: string;
    contactPerson?: string;
    performanceScore?: number;
    status?: string;
  } | string | null;
  createdBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export type MilestoneStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Delayed";

export interface Milestone {
  _id: string;
  project: string | { _id: string; name: string; projectCode?: string };
  name: string;
  description?: string;
  plannedDate?: string;
  actualDate?: string;
  completionPercentage: number;
  status: MilestoneStatus;
  verifiedBy?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
  } | string | null;
  verificationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  _id: string;
  project: string | { _id: string; name: string; projectCode?: string };
  allocatedAmount: number;
  utilizedAmount: number;
  remainingAmount: number;
  category: string;
  description?: string;
  lastUpdatedBy?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export type ContractorStatus = "Active" | "Inactive" | "Blocked" | "Pending";

export interface Contractor {
  _id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  performanceScore: number;
  status: ContractorStatus;
  user?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
  } | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type InspectionStatus = "Scheduled" | "Completed" | "Failed";

export interface Inspection {
  _id: string;
  project: string | { _id: string; name: string; projectCode?: string };
  inspector: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role?: string;
  } | string;
  inspectionDate: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  status: InspectionStatus;
  completionPercentage: number;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentType =
  | "Contract"
  | "Approval"
  | "Estimate"
  | "Invoice"
  | "Progress Report"
  | "Completion Report"
  | "Other";

export type DocumentClassification =
  | "PUBLIC"
  | "INTERNAL"
  | "RESTRICTED"
  | "CONFIDENTIAL";

export interface DocumentItem {
  _id: string;
  project: string | { _id: string; name: string; projectCode?: string };
  uploadedBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role?: string;
  } | string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  classification: DocumentClassification;
  description?: string;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
