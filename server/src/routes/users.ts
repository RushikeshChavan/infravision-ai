import { Router } from "express";
import { createUser } from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLES } from "../types/auth";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN]),
  createUser,
);

export default router;
