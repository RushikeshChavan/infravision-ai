import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  getBudgetById,
  getBudgetsByProject,
  updateBudget,
} from "../controllers/budgetController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

// Admin-only creation & distribution
router.post(
  "/",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  createBudget,
);

// Read monitoring for internal authorized roles (Citizens cannot access internal line-item budgets)
router.get(
  "/project/:projectId",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.AUDITOR,
  ]),
  getBudgetsByProject,
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
  ]),
  getBudgetById,
);

// Admin-only modification & deletion
router.put(
  "/:id",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  updateBudget,
);

router.delete(
  "/:id",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  deleteBudget,
);

export default router;
