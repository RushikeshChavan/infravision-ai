import { apiClient } from "./client";
import { Budget } from "../types";

export async function getBudgetsByProjectApi(
  projectId: string,
): Promise<{ budgets: Budget[] }> {
  return apiClient<{ budgets: Budget[] }>(`/budgets/project/${projectId}`, {
    method: "GET",
  });
}

export async function getBudgetByIdApi(id: string): Promise<{ budget: Budget }> {
  return apiClient<{ budget: Budget }>(`/budgets/${id}`, {
    method: "GET",
  });
}

export async function createBudgetApi(
  data: Partial<Budget> & { project: string; allocatedAmount: number; category: string },
): Promise<{ message: string; budget: Budget }> {
  return apiClient<{ message: string; budget: Budget }>("/budgets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBudgetApi(
  id: string,
  data: Partial<Budget>,
): Promise<{ message: string; budget: Budget }> {
  return apiClient<{ message: string; budget: Budget }>(`/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBudgetApi(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/budgets/${id}`, {
    method: "DELETE",
  });
}
