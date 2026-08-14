import { apiClient } from "./client";
import { DocumentItem } from "../types";

export async function getDocumentsByProjectApi(
  projectId: string,
): Promise<{ documents: DocumentItem[] }> {
  return apiClient<{ documents: DocumentItem[] }>(
    `/documents/project/${projectId}`,
    {
      method: "GET",
    },
  );
}

export async function getDocumentByIdApi(
  id: string,
): Promise<{ document: DocumentItem }> {
  return apiClient<{ document: DocumentItem }>(`/documents/${id}`, {
    method: "GET",
  });
}

export async function createDocumentApi(
  data: Partial<DocumentItem> & {
    project: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
  },
): Promise<{ message: string; document: DocumentItem }> {
  return apiClient<{ message: string; document: DocumentItem }>(
    "/documents",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteDocumentApi(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/documents/${id}`, {
    method: "DELETE",
  });
}
