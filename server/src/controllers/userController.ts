import { Request, Response } from "express";
import UserModel from "../models/user";
import { USER_ROLES, UserRole } from "../types/auth";

const ALLOWED_CREATABLE_ROLES: UserRole[] = [
  USER_ROLES.DEPARTMENT_ADMIN,
  USER_ROLES.PROJECT_MANAGER,
  USER_ROLES.FIELD_ENGINEER,
  USER_ROLES.CONTRACTOR,
  USER_ROLES.AUDITOR,
];

export async function createUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      error: "Name, email, password, and role are required",
    });
  }

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password === ""
  ) {
    return res.status(400).json({
      error: "Name, email, and password must be non-empty strings",
    });
  }

  // Citizens must NOT be created through this administrative endpoint
  if (role === USER_ROLES.CITIZEN) {
    return res.status(400).json({
      error: "Citizen accounts cannot be created through the admin user management endpoint",
    });
  }

  // Only allow specified internal roles
  if (!ALLOWED_CREATABLE_ROLES.includes(role as UserRole)) {
    return res.status(400).json({
      error: `Invalid role. Creatable internal roles are: ${ALLOWED_CREATABLE_ROLES.join(", ")}`,
    });
  }

  // Department Admin scoping: can only create users within their own department
  if (req.user.role === USER_ROLES.DEPARTMENT_ADMIN) {
    if (!req.user.department || req.user.department.trim() === "") {
      return res.status(403).json({
        error: "Department Admin does not have an assigned department",
      });
    }

    if (
      !department ||
      typeof department !== "string" ||
      department.trim() === ""
    ) {
      return res.status(400).json({
        error: "Department is required when creating a user as Department Admin",
      });
    }

    if (department.trim() !== req.user.department.trim()) {
      return res.status(403).json({
        error: "Department Admins can only create users within their own department",
      });
    }
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        error: "A user with this email already exists",
      });
    }

    const assignedDepartment =
      department && typeof department === "string" && department.trim() !== ""
        ? department.trim()
        : undefined;

    const user = new UserModel({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role as UserRole,
      department: assignedDepartment,
    });

    await user.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "A user with this email already exists",
      });
    }

    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
}
