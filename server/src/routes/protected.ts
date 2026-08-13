import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.PROJECT_MANAGER_ENGINEER,
    USER_ROLES.FIELD_ENGINEER_INSPECTOR,
    USER_ROLES.CONTRACTOR,
    USER_ROLES.AUDITOR,
    USER_ROLES.CITIZEN,
  ]),
  (req, res) => {
    res.json({ message: "Protected access granted.", user: req.user });
  },
);

export default router;
