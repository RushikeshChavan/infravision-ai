import { apiClient } from "./client";
import { Inspection } from "../types";

export async function getInspectionsByProjectApi(
  projectId: string,
): Promise<{ inspections: Inspection[] }> {
  return apiClient<{ inspections: Inspection[] }>(
    `/inspections/project/${projectId}`,
    {
      method: "GET",
    },
  );
}

export async function getInspectionByIdApi(
  id: string,
): Promise<{ inspection: Inspection }> {
  return apiClient<{ inspection: Inspection }>(`/inspections/${id}`, {
    method: "GET",
  });
}

export async function createInspectionApi(
  data: Partial<Inspection> & { project: string; inspectionDate: string },
): Promise<{ message: string; inspection: Inspection }> {
  return apiClient<{ message: string; inspection: Inspection }>(
    "/inspections",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateInspectionApi(
  id: string,
  data: Partial<Inspection>,
): Promise<{ message: string; inspection: Inspection }> {
  return apiClient<{ message: string; inspection: Inspection }>(
    `/inspections/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}
