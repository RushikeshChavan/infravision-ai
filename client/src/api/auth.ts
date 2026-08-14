import { apiClient } from "./client";
import { AuthResponse, User } from "../types";

export async function loginApi(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerCitizenApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMeApi(): Promise<{ user: User }> {
  return apiClient<{ user: User }>("/auth/me", {
    method: "GET",
  });
}
