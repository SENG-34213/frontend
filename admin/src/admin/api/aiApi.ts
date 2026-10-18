import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

interface AiConversationResponse {
  id: string;
  title?: string;
}

interface AiChatResponse {
  conversationId: string;
  messageId: string;
  clientMessageId?: string;
  message: string;
  toolsUsed?: string[];
  timestamp?: string;
}

export async function createAiConversation(title?: string) {
  const response = await apiRequest<ApiResponse<AiConversationResponse>>("/api/ai/conversations", {
    method: "POST",
    body: title ? { title } : {},
  });
  if (!response.data?.id) throw new Error(response.message || "Unable to create AI conversation.");
  return response.data;
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
  if (!response.data?.message)
    throw new Error(response.message || "AI service returned no response.");
  return response.data;
}
