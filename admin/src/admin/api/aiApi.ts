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
  attachmentName?: string;
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

export async function fetchAiConversations(): Promise<AiConversation[]> {
  const response = await apiRequest<ApiResponse<AiConversation[]>>("/api/ai/conversations");
  return requireData(response, "Unable to load AI conversations.");
}

export async function fetchAiMessages(conversationId: string): Promise<AiMessage[]> {
  const response = await apiRequest<ApiResponse<AiMessage[]>>(
    `/api/ai/conversations/${conversationId}/messages`,
  );
  return requireData(response, "Unable to load this AI conversation.");
}

export async function createAiConversation(title?: string): Promise<AiConversation> {
  const response = await apiRequest<ApiResponse<AiConversation>>("/api/ai/conversations", {
    method: "POST",
    body: title ? { title } : {},
  });
  return requireData(response, "Unable to create AI conversation.");
}

export async function updateAiConversation(id: string, title: string): Promise<AiConversation> {
  const response = await apiRequest<ApiResponse<AiConversation>>(`/api/ai/conversations/${id}`, {
    method: "PUT",
    body: { title },
  });
  return requireData(response, "Unable to rename AI conversation.");
}

export async function deleteAiConversation(id: string): Promise<void> {
  await apiRequest<ApiResponse<unknown>>(`/api/ai/conversations/${id}`, { method: "DELETE" });
}

export async function sendAiMessage(
  conversationId: string,
  message: string,
  clientMessageId: string,
  file?: File,
): Promise<AiChatResponse> {
  const body = file
    ? (() => {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("message", message);
        formData.append("clientMessageId", clientMessageId);
        formData.append("file", file);
        return formData;
      })()
    : { conversationId, message, clientMessageId };
  const response = await apiRequest<ApiResponse<AiChatResponse>>("/api/ai/chat", {
    method: "POST",
    body,
  });
  return requireData(response, "AI service returned no response.");
}

export function messageText(message: AiMessage): string {
  return message.message || message.content || "";
}

export function messageRole(message: AiMessage): "user" | "assistant" {
  return message.role === "USER" || message.sender === "user" ? "user" : "assistant";
}

export function messageTime(message: AiMessage): string {
  const value = message.timestamp || message.createdAt;
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
