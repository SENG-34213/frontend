import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface AiConversation {
  id: string;
  title?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiMessage {
  id: string;
  role?: "USER" | "ASSISTANT" | "SYSTEM" | string;
  sender?: "user" | "assistant" | string;
  message?: string;
  content?: string;
  createdAt?: string;
  timestamp?: string;
  toolsUsed?: string[];
}

export interface AiChatResponse {
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

export async function fetchAiConversations() {
  const response = await apiRequest<ApiResponse<AiConversation[]>>("/api/ai/conversations");
  return requireData(response, "Unable to load AI conversations.");
}

export async function fetchAiMessages(conversationId: string) {
  const response = await apiRequest<ApiResponse<AiMessage[]>>(
    `/api/ai/conversations/${conversationId}/messages`,
  );
  return requireData(response, "Unable to load this AI conversation.");
}

export async function createAiConversation(title?: string) {
  const response = await apiRequest<ApiResponse<AiConversation>>("/api/ai/conversations", {
    method: "POST",
    body: title ? { title } : {},
  });
  return requireData(response, "Unable to create AI conversation.");
}

export async function updateAiConversation(id: string, title: string) {
  const response = await apiRequest<ApiResponse<AiConversation>>(`/api/ai/conversations/${id}`, {
    method: "PUT",
    body: { title },
  });
  return requireData(response, "Unable to rename AI conversation.");
}

export async function deleteAiConversation(id: string) {
  await apiRequest<ApiResponse<unknown>>(`/api/ai/conversations/${id}`, { method: "DELETE" });
}

export async function sendAiMessage(
  conversationId: string,
  message: string,
  clientMessageId: string,
) {
  const response = await apiRequest<ApiResponse<AiChatResponse>>("/api/ai/chat", {
    method: "POST",
    body: { conversationId, message, clientMessageId },
  });
  return requireData(response, "AI service returned no response.");
}

export function messageText(message: AiMessage) {
  return message.message || message.content || "";
}

export function messageRole(message: AiMessage): "user" | "assistant" {
  return message.role === "USER" || message.sender === "user" ? "user" : "assistant";
}

export function messageTime(message: AiMessage) {
  const value = message.timestamp || message.createdAt;
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
