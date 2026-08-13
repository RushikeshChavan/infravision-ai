export const USER_ROLES = {
  SUPER_ADMIN: "Super Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  PROJECT_MANAGER_ENGINEER: "Project Manager / Engineer",
  FIELD_ENGINEER_INSPECTOR: "Field Engineer / Inspector",
  CONTRACTOR: "Contractor",
  AUDITOR: "Auditor",
  CITIZEN: "Citizen",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}
