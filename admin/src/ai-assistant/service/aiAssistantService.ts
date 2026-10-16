export type AuthorizedApiRequest = (url: string, options: RequestInit) => Promise<Response>;
export type Conversation = {
  id: string;
  title?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt?: string;
};
export type AiEvent = {
  type?: string;
  eventType?: string;
  status?: string;
  message?: string;
  content?: string;
  chunk?: string;
  conversationId?: string;
  messageId?: string;
};

const json = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.message || body.error || `The AI service returned ${response.status}.`);
  return body?.data ?? body;
};
const conversationsPath = () =>
  process.env.NEXT_PUBLIC_AI_CONVERSATIONS_PATH || "/api/ai/conversations";
export async function listConversations(request: AuthorizedApiRequest) {
  const result = await json(await request(conversationsPath(), { method: "GET" }));
  return (Array.isArray(result) ? result : (result?.content ?? result?.conversations ?? [])).map(
    normalizeConversation,
  );
}
export async function createConversation(
  request: AuthorizedApiRequest,
  title = "New conversation",
) {
  const result = await json(
    await request(conversationsPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }),
  );
  return normalizeConversation(result?.conversation ?? result);
}
export async function renameConversation(request: AuthorizedApiRequest, id: string, title: string) {
  return normalizeConversation(
    (await json(
      await request(`${conversationsPath()}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      }),
    )) as Record<string, unknown>,
  );
}
export async function deleteConversation(request: AuthorizedApiRequest, id: string) {
  await json(
    await request(`${conversationsPath()}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  );
}
export async function listMessages(request: AuthorizedApiRequest, id: string) {
  const result = await json(
    await request(`${conversationsPath()}/${encodeURIComponent(id)}/messages`, { method: "GET" }),
  );
  return (Array.isArray(result) ? result : (result?.messages ?? result?.content ?? [])).map(
    normalizeMessage,
  );
}
function normalizeConversation(value: Record<string, unknown>): Conversation {
  return {
    id: String(value.id ?? value.conversationId),
    title: String(value.title ?? value.name ?? "New conversation"),
    name: String(value.name ?? value.title ?? "New conversation"),
    createdAt: value.createdAt as string | undefined,
    updatedAt: value.updatedAt as string | undefined,
  };
}
function normalizeMessage(value: Record<string, unknown>): ChatMessage {
  const role = String(value.role ?? value.sender ?? value.messageType ?? "ASSISTANT").toUpperCase();
  return {
    id: String(value.id ?? value.messageId ?? `${Date.now()}-${Math.random()}`),
    role: role.includes("USER") ? "USER" : role.includes("SYSTEM") ? "SYSTEM" : "ASSISTANT",
    content: String(value.content ?? value.message ?? value.text ?? ""),
    createdAt: value.createdAt as string | undefined,
  };
}
export function websocketUrl(apiUrl: string) {
  if (process.env.NEXT_PUBLIC_AI_WS_URL) return process.env.NEXT_PUBLIC_AI_WS_URL;
  return `${apiUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ws/ai`;
}
export const websocketDestination =
  process.env.NEXT_PUBLIC_AI_WS_SEND_DESTINATION || "/app/ai/chat";
export const websocketSubscription =
  process.env.NEXT_PUBLIC_AI_WS_SUBSCRIPTION || "/user/queue/ai/chat";
