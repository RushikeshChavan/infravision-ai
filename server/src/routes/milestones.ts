import { Router } from "express";
import {
  createMilestone,
  deleteMilestone,
  getMilestoneById,
  getMilestonesByProject,
  updateMilestone,
} from "../controllers/milestoneController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
  ]),
  createMilestone,
);

router.get(
  "/project/:projectId",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.AUDITOR,
    USER_ROLES.CITIZEN,
  ]),
  getMilestonesByProject,
);

router.get(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.AUDITOR,
    USER_ROLES.CITIZEN,
  ]),
  getMilestoneById,
);

router.put(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.FIELD_ENGINEER,
  ]),
  updateMilestone,
);

router.delete(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
  ]),
  deleteMilestone,
);

export default router;
