import { Router } from "express";
import {
  createInspection,
  getInspectionById,
  getInspectionsByProject,
  updateInspection,
} from "../controllers/inspectionController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

// Create inspection: Admin, PM, Field Engineer
router.post(
  "/",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
  ]),
  createInspection,
);

// Read inspections: Admin, PM, Field Engineer, Auditor
router.get(
  "/project/:projectId",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.AUDITOR,
  ]),
  getInspectionsByProject,
);

router.get(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.AUDITOR,
  ]),
  getInspectionById,
);

// Update inspection: Admin, PM, Field Engineer
router.put(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
  ]),
  updateInspection,
);

export default router;
