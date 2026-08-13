import { Request, Response, NextFunction } from "express";
import { USER_ROLES, UserRole } from "../types/auth";

export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient role permissions" });
    }

    next();
  };
}

export const authz = {
  allowSuperAdmin: authorize([USER_ROLES.SUPER_ADMIN]),
  allowAdminOnly: authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
  ]),
  allowProjectTeam: authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER_ENGINEER,
  ]),
  allowContractor: authorize([USER_ROLES.CONTRACTOR]),
  allowAuditor: authorize([USER_ROLES.AUDITOR]),
  allowFieldEngineer: authorize([USER_ROLES.FIELD_ENGINEER_INSPECTOR]),
};
