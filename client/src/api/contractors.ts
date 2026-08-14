import { apiClient } from "./client";
import { Contractor } from "../types";

export async function getContractorsApi(): Promise<{ contractors: Contractor[] }> {
  return apiClient<{ contractors: Contractor[] }>("/contractors", {
    method: "GET",
  });
}

export async function getContractorByIdApi(
  id: string,
): Promise<{ contractor: Contractor }> {
  return apiClient<{ contractor: Contractor }>(`/contractors/${id}`, {
    method: "GET",
  });
}

export async function createContractorApi(
  data: Partial<Contractor>,
): Promise<{ message: string; contractor: Contractor }> {
  return apiClient<{ message: string; contractor: Contractor }>("/contractors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContractorApi(
  id: string,
  data: Partial<Contractor>,
): Promise<{ message: string; contractor: Contractor }> {
  return apiClient<{ message: string; contractor: Contractor }>(`/contractors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteContractorApi(
  id: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/contractors/${id}`, {
    method: "DELETE",
  });
}
