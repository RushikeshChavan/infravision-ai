import { Request, Response } from "express";
import UserModel from "../models/user";
import { signJwt } from "../utils/jwt";
import { USER_ROLES } from "../types/auth";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  // Public registration must not allow clients to set roles.
  if (req.body.role) {
    return res
      .status(400)
      .json({ error: "Role cannot be set during public registration." });
  }

  const existing = await UserModel.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existing) {
    return res
      .status(409)
      .json({ error: "A user with this email already exists." });
  }

  // Force the role to Citizen for all public self-registered accounts
  const user = new UserModel({ name, email, password, role: USER_ROLES.CITIZEN });
  await user.save();

  const token = signJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
  });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  res.json({ user: req.user });
}
