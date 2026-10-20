import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type CommunicationGroup = {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "ARCHIVED" | string;
};

export type CommunicationGroupMember = {
  userId: string;
  role: string;
  joinedAt: string;
};

export type CommunicationAttachmentType = "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO" | "OTHER";

export type CommunicationAttachment = {
  id: string;
  materialId: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  checksum?: string;
  attachmentType: CommunicationAttachmentType;
};

export type CommunicationMessage = {
  id: string;
  groupId: string;
  senderId: string;
  content?: string | null;
  type?: string;
  sentAt: string;
  editedAt?: string;
  edited: boolean;
  deletedForEveryone: boolean;
  attachments: CommunicationAttachment[];
};

export type CommunicationMessagePage = {
  content: CommunicationMessage[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CommunicationAttachmentDownload = {
  originalFilename: string;
  contentType: string;
  fileSize: number;
  downloadUrl: string;
  expiresAt: string;
};

const groupPath = (groupId: string) => encodeURIComponent(groupId);

export async function getCommunicationGroups(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<CommunicationGroup[]>>(
    "/api/communication/groups",
    { signal },
  );
  return response.data ?? [];
}

export async function getCommunicationGroup(groupId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<CommunicationGroup>>(
    `/api/communication/groups/${groupPath(groupId)}`,
    { signal },
  );
  return response.data;
}

export async function createCommunicationGroup(payload: {
  courseId: string;
  name: string;
  description?: string;
}) {
  const response = await apiRequest<ApiResponse<CommunicationGroup>>("/api/communication/groups", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function getCommunicationGroupMembers(groupId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<CommunicationGroupMember[]>>(
    `/api/communication/groups/${groupPath(groupId)}/members`,
    { signal },
  );
  return response.data ?? [];
}

export async function addStudentToCommunicationGroup(groupId: string, studentId: string) {
  const response = await apiRequest<ApiResponse<CommunicationGroupMember>>(
    `/api/communication/groups/${groupPath(groupId)}/students`,
    { method: "POST", body: { studentId } },
  );
  return response.data;
}

export async function addStudentToCourseCommunicationGroup(courseId: string, studentId: string) {
  const response = await apiRequest<ApiResponse<CommunicationGroupMember>>(
    `/api/communication/groups/courses/${encodeURIComponent(courseId)}/students`,
    { method: "POST", body: { studentId } },
  );
  return response.data;
}

export async function archiveCommunicationGroup(groupId: string) {
  const response = await apiRequest<ApiResponse<CommunicationGroup>>(
    `/api/communication/groups/${groupPath(groupId)}/archive`,
    { method: "POST" },
  );
  return response.data;
}

export async function unarchiveCommunicationGroup(groupId: string) {
  const response = await apiRequest<ApiResponse<CommunicationGroup>>(
    `/api/communication/groups/${groupPath(groupId)}/unarchive`,
    { method: "POST" },
  );
  return response.data;
}

export async function getCommunicationMessages(
  groupId: string,
  page = 0,
  size = 30,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await apiRequest<ApiResponse<CommunicationMessagePage>>(
    `/api/communication/groups/${groupPath(groupId)}/messages?${params.toString()}`,
    { signal },
  );
  return response.data ?? { content: [], page, size, totalElements: 0, totalPages: 0 };
}

export async function uploadCommunicationAttachment(groupId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiRequest<ApiResponse<CommunicationAttachment>>(
    `/api/communication/groups/${groupPath(groupId)}/messages/attachments`,
    { method: "POST", body: formData },
  );
  return response.data;
}

export async function sendCommunicationMessage(
  groupId: string,
  content: string,
  attachmentIds: string[] = [],
) {
  const response = await apiRequest<ApiResponse<CommunicationMessage>>(
    `/api/communication/groups/${groupPath(groupId)}/messages`,
    {
      method: "POST",
      body: { content: content.trim() || null, attachmentIds },
    },
  );
  return response.data;
}

export async function getCommunicationAttachmentDownload(
  groupId: string,
  messageId: string,
  attachmentId: string,
) {
  const response = await apiRequest<ApiResponse<CommunicationAttachmentDownload>>(
    `/api/communication/groups/${groupPath(groupId)}/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
  );
  return response.data;
}

export async function updateCommunicationMessage(
  groupId: string,
  messageId: string,
  content: string,
) {
  const response = await apiRequest<ApiResponse<CommunicationMessage>>(
    `/api/communication/groups/${groupPath(groupId)}/messages/${encodeURIComponent(messageId)}`,
    { method: "PATCH", body: { content } },
  );
  return response.data;
}

export async function deleteCommunicationMessage(
  groupId: string,
  messageId: string,
  scope: "ME" | "EVERYONE" = "ME",
) {
  await apiRequest<ApiResponse<null>>(
    `/api/communication/groups/${groupPath(groupId)}/messages/${encodeURIComponent(messageId)}?scope=${scope}`,
    { method: "DELETE" },
  );
}
