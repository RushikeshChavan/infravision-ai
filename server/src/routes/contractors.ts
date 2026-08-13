import { Router } from "express";
import {
  createContractor,
  deleteContractor,
  getContractorById,
  getContractors,
  updateContractor,
} from "../controllers/contractorController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

// Admin-only creation
router.post(
  "/",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  createContractor,
);

// Read access for authenticated internal roles
router.get(
  "/",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.AUDITOR,
  ]),
  getContractors,
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
  getContractorById,
);

// Admin-only modification & deletion
router.put(
  "/:id",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  updateContractor,
);

router.delete(
  "/:id",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  deleteContractor,
);

export default router;
