import { AuthenticatedRequestUser } from "../../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}
