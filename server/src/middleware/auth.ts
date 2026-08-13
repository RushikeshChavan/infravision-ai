import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyJwt(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      department: payload.department,
    };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Invalid or expired authentication token" });
  }
}
