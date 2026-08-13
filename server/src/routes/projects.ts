import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/projectController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  createProject,
);

router.get(
  "/",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.AUDITOR,
    USER_ROLES.CITIZEN,
  ]),
  getProjects,
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
  getProjectById,
);

router.put(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
  ]),
  updateProject,
);

router.delete(
  "/:id",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  deleteProject,
);

export default router;
