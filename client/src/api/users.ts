import { apiClient } from "./client";
import { User, UserRole } from "../types";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
}

export async function createUserApi(
  data: CreateUserData,
): Promise<{ message: string; user: User }> {
  return apiClient<{ message: string; user: User }>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
