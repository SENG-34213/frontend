import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface StudentAiConversation {
  id: string;
  title?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAiMessage {
  id: string;
  role?: "USER" | "ASSISTANT" | "SYSTEM" | string;
  content?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
  toolsUsed?: string[];
}

export interface StudentAiChatResponse {
  conversationId: string;
  messageId: string;
  clientMessageId?: string;
  message: string;
  toolsUsed?: string[];
  timestamp?: string;
}

function requireData<T>(response: ApiResponse<T>, fallback: string): T {
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export async function fetchStudentAiConversations(): Promise<StudentAiConversation[]> {
  const response = await apiRequest<ApiResponse<StudentAiConversation[]>>("/api/ai/conversations");
  return requireData(response, "Unable to load AI conversations.");
}

export async function fetchStudentAiMessages(conversationId: string): Promise<StudentAiMessage[]> {
  const response = await apiRequest<ApiResponse<StudentAiMessage[]>>(
    `/api/ai/conversations/${conversationId}/messages`,
  );
  return requireData(response, "Unable to load this AI conversation.");
}

export async function createStudentAiConversation(title?: string): Promise<StudentAiConversation> {
  const response = await apiRequest<ApiResponse<StudentAiConversation>>("/api/ai/conversations", {
    method: "POST",
    body: title ? { title } : {},
  });
  return requireData(response, "Unable to create an AI conversation.");
}

export async function renameStudentAiConversation(
  id: string,
  title: string,
): Promise<StudentAiConversation> {
  const response = await apiRequest<ApiResponse<StudentAiConversation>>(
    `/api/ai/conversations/${id}`,
    { method: "PUT", body: { title } },
  );
  return requireData(response, "Unable to rename this AI conversation.");
}

export async function deleteStudentAiConversation(id: string): Promise<void> {
  await apiRequest<ApiResponse<unknown>>(`/api/ai/conversations/${id}`, { method: "DELETE" });
}

export async function sendStudentAiMessage(
  conversationId: string,
  message: string,
  clientMessageId: string,
): Promise<StudentAiChatResponse> {
  const response = await apiRequest<ApiResponse<StudentAiChatResponse>>("/api/ai/chat", {
    method: "POST",
    body: { conversationId, message, clientMessageId },
  });
  return requireData(response, "The AI service returned no response.");
}

export function studentAiMessageText(message: StudentAiMessage) {
  return message.message || message.content || "";
}

export function studentAiMessageRole(message: StudentAiMessage): "user" | "assistant" {
  return message.role === "USER" ? "user" : "assistant";
}

export function studentAiMessageTime(message: StudentAiMessage) {
  const value = message.timestamp || message.createdAt;
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
