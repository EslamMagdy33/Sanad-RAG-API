import { request } from "./client";
import type { components } from "./schema";

export type DocumentDto = components["schemas"]["DocumentDto"];

export function listDocuments(): Promise<DocumentDto[]> {
  return request<DocumentDto[]>("/api/documents");
}

export function getDocument(id: string): Promise<DocumentDto> {
  return request<DocumentDto>(`/api/documents/${id}`);
}

export function uploadDocument(file: File): Promise<DocumentDto | null> {
  const form = new FormData();
  form.append("file", file); // لازم الاسم "file" زي ما الباك طالب
  return request<DocumentDto | null>("/api/documents", { method: "POST", form });
}

export function deleteDocument(id: string): Promise<void> {
  return request<void>(`/api/documents/${id}`, { method: "DELETE" });
}
