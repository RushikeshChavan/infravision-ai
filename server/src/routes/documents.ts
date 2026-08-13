import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocumentsByProject,
} from "../controllers/documentController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

// Create document: Admin, PM, Field Engineer, Contractor
router.post(
  "/",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.FIELD_ENGINEER,
    USER_ROLES.CONTRACTOR,
  ]),
  createDocument,
);

// Read documents: Authenticated users (Classification visibility enforced inside controller)
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
  getDocumentsByProject,
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
  getDocumentById,
);

// Delete document: Admin, PM
router.delete(
  "/:id",
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER,
  ]),
  deleteDocument,
);

export default router;
