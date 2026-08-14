import { apiClient } from "./client";
import { Project } from "../types";

export async function getProjectsApi(): Promise<{ projects: Project[] }> {
  return apiClient<{ projects: Project[] }>("/projects", {
    method: "GET",
  });
}

export async function getProjectByIdApi(
  id: string,
): Promise<{ project: Project }> {
  return apiClient<{ project: Project }>(`/projects/${id}`, {
    method: "GET",
  });
}

export async function createProjectApi(
  data: Partial<Project>,
): Promise<{ message: string; project: Project }> {
  return apiClient<{ message: string; project: Project }>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProjectApi(
  id: string,
  data: Partial<Project>,
): Promise<{ message: string; project: Project }> {
  return apiClient<{ message: string; project: Project }>(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProjectApi(
  id: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/projects/${id}`, {
    method: "DELETE",
  });
}
