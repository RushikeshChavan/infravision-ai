import { apiClient } from "./client";
import { Milestone } from "../types";

export async function getMilestonesByProjectApi(
  projectId: string,
): Promise<{ milestones: Milestone[] }> {
  return apiClient<{ milestones: Milestone[] }>(
    `/milestones/project/${projectId}`,
    {
      method: "GET",
    },
  );
}

export async function getMilestoneByIdApi(
  id: string,
): Promise<{ milestone: Milestone }> {
  return apiClient<{ milestone: Milestone }>(`/milestones/${id}`, {
    method: "GET",
  });
}

export async function createMilestoneApi(
  data: Partial<Milestone> & { project: string; name: string },
): Promise<{ message: string; milestone: Milestone }> {
  return apiClient<{ message: string; milestone: Milestone }>("/milestones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMilestoneApi(
  id: string,
  data: Partial<Milestone>,
): Promise<{ message: string; milestone: Milestone }> {
  return apiClient<{ message: string; milestone: Milestone }>(
    `/milestones/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteMilestoneApi(
  id: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/milestones/${id}`, {
    method: "DELETE",
  });
}
