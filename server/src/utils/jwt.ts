import { SignOptions, Secret, sign, verify } from "jsonwebtoken";
import { AuthTokenPayload } from "../types/auth";

const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "1h";

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable JWT_SECRET");
  }
  return secret;
}

export function signJwt(payload: AuthTokenPayload): string {
  return sign(payload as string | Buffer | object, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN as unknown as number,
  });
}

export function verifyJwt(token: string): AuthTokenPayload {
  const payload = verify(token, getJwtSecret()) as unknown;
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid token payload");
  }

  return payload as AuthTokenPayload;
}
