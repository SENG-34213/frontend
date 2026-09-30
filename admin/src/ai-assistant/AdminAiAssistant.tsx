"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { Icon } from "@/components/admin/Icon";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { createConversation, deleteConversation, listConversations, listMessages, renameConversation, type AuthorizedApiRequest, type ChatMessage as Message, type Conversation } from "./service/aiAssistantService";

type Props = { apiRequest: AuthorizedApiRequest; apiUrl?: string; token?: string };
type AiSocketPayload = { status?: string; message?: string; conversationId?: string; data?: { status?: string; messageId?: string; conversationId?: string; content?: string; message?: string } };

export function AdminAiAssistant({ apiRequest, apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080", token: authToken = "" }: Props) {
  const token = authToken || (typeof window !== "undefined" ? sessionStorage.getItem("mentify_access_token") || "" : "");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("connecting");
  const [maximized, setMaximized] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const subscription = useRef<StompSubscription | undefined>(undefined);
  const activeIdRef = useRef<string | undefined>(undefined);
  const pendingResponseRef = useRef<{ conversationId: string; assistantCount: number } | null>(null);
  const unmounting = useRef(false);
  const scroll = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => { setLoading(true); try { const items = await listConversations(apiRequest); setConversations(items); if (items[0]) setActive(items[0]); } catch (e) { setError(e instanceof Error ? e.message : "Could not load your conversations."); } finally { setLoading(false); } }, [apiRequest]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { activeIdRef.current = active?.id; if (pendingResponseRef.current && pendingResponseRef.current.conversationId !== active?.id) pendingResponseRef.current = null; }, [active]);
  useEffect(() => { if (!active) return; let cancelled = false; setHistoryLoading(true); void listMessages(apiRequest, active.id).then((items) => { if (!cancelled) setMessages(items); }).catch(() => { if (!cancelled) setError("Could not load this conversation."); }).finally(() => { if (!cancelled) setHistoryLoading(false); }); return () => { cancelled = true; }; }, [active, apiRequest]);

  useEffect(() => {
    if (!token) { setConnection("disconnected"); return; }
    unmounting.current = false;
    const client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_AI_WS_URL || `${apiUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ws/ai`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnection("connected");
        setError("");
        subscription.current = client.subscribe("/user/queue/ai/chat", (frame: IMessage) => {
          let payload: AiSocketPayload;
          try { payload = JSON.parse(frame.body) as AiSocketPayload; } catch { setProcessing(false); setError("Mentify AI returned an unreadable response."); return; }
          const status = String(payload.status || payload.data?.status || "").trim().toUpperCase();
          if (status === "PROCESSING") setProcessing(true);
          else if (status === "ERROR") { pendingResponseRef.current = null; setProcessing(false); setError(payload.message || "Mentify AI could not complete that request."); }
          else if (status === "COMPLETED") { pendingResponseRef.current = null; setProcessing(false); const conversationId = payload.conversationId || payload.data?.conversationId || activeIdRef.current; const answer = payload.data?.message || payload.data?.content; if (conversationId && answer && conversationId === activeIdRef.current) { setMessages((current) => { const messageId = payload.data?.messageId || `assistant-${Date.now()}`; if (current.some((item) => item.id === messageId || (item.role === "ASSISTANT" && item.content === answer))) return current; return [...current, { id: messageId, role: "ASSISTANT", content: answer, createdAt: new Date().toISOString() }]; }); } else if (conversationId) { void listMessages(apiRequest, conversationId).then((items) => { if (conversationId === activeIdRef.current) setMessages(items); }).catch(() => setError("The response was generated, but the conversation could not be refreshed.")); } }
        });
      },
      onStompError: () => { if (!unmounting.current) { setConnection("disconnected"); setProcessing(false); setError("Mentify AI connection was rejected. Please sign in again."); } },
      onWebSocketClose: () => { if (!unmounting.current) setConnection("disconnected"); },
      onWebSocketError: () => { if (!unmounting.current) setConnection("disconnected"); },
    });
    stompClient.current = client;
    client.activate();
    return () => { unmounting.current = true; subscription.current?.unsubscribe(); subscription.current = undefined; stompClient.current = null; void client.deactivate(); };
  }, [apiRequest, apiUrl, token]);
  useEffect(() => { const node = scroll.current; if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" }); }, [messages, processing]);

  async function newChat() { try { const conversation = await createConversation(apiRequest); setConversations((items) => [conversation, ...items]); setActive(conversation); setMessages([]); } catch { setError("Could not create a new conversation."); } }
  async function removeConversation(id: string) { try { await deleteConversation(apiRequest, id); const next = conversations.filter((item) => item.id !== id); setConversations(next); setActive(active?.id === id ? next[0] ?? null : active); } catch { setError("Could not delete this conversation."); } }
  async function rename(id: string) { const current = conversations.find((item) => item.id === id); const title = window.prompt("Conversation name", current?.title || "New conversation"); if (!title?.trim()) return; try { const updated = await renameConversation(apiRequest, id, title.trim()); setConversations((items) => items.map((item) => item.id === id ? updated : item)); if (active?.id === id) setActive(updated); } catch { setError("Could not rename this conversation."); } }
  async function reconcileResponse(conversationId: string, assistantCount: number) { for (let attempt = 0; attempt < 60 && pendingResponseRef.current?.conversationId === conversationId; attempt += 1) { await new Promise((resolve) => window.setTimeout(resolve, 1000)); if (pendingResponseRef.current?.conversationId !== conversationId) return; try { const items = await listMessages(apiRequest, conversationId); const assistantMessages = items.filter((item: Message) => item.role === "ASSISTANT"); if (assistantMessages.length > assistantCount) { pendingResponseRef.current = null; setMessages(items); setProcessing(false); return; } } catch { /* The STOMP response may still arrive; keep waiting. */ } } if (pendingResponseRef.current?.conversationId === conversationId) { pendingResponseRef.current = null; setProcessing(false); setError("Mentify AI is taking longer than expected. Try sending the question again."); } }
  function send(content: string) { const message = content.trim(); const conversationId = active?.id; if (!message || !conversationId || !stompClient.current?.connected || processing) return; const clientMessageId = crypto.randomUUID(); const assistantCount = messages.filter((item) => item.role === "ASSISTANT").length; pendingResponseRef.current = { conversationId, assistantCount }; setMessages((items) => [...items, { id: `local-${clientMessageId}`, role: "USER", content: message, createdAt: new Date().toISOString() }]); setProcessing(true); stompClient.current.publish({ destination: "/app/ai/chat", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ conversationId, message, clientMessageId }) }); void reconcileResponse(conversationId, assistantCount); }

  return <section className={`ai-assistant ${maximized ? "is-maximized" : ""}`}><div className="ai-assistant-heading"><div><span className="catalog-kicker">MENTIFY INTELLIGENCE</span><h2>Mentify AI Assistant</h2><p>Your conversations are saved to your authenticated workspace.</p></div><div className="ai-assistant-actions"><button type="button" className="secondary-button" onClick={() => void newChat()}><Icon name="plus" size={15} /> New chat</button><button type="button" className="secondary-button ai-expand-button" onClick={() => setMaximized((current) => !current)} aria-label={maximized ? "Minimize AI assistant" : "Maximize AI assistant"} title={maximized ? "Minimize" : "Maximize"}>{maximized ? "↙ Minimize" : "⛶ Maximize"}</button></div></div><div className="ai-chat-panel ai-chat-layout"><aside className="ai-conversation-sidebar"><button type="button" className="ai-new-chat" onClick={() => void newChat()}><Icon name="plus" size={15} /> New chat</button><span className="ai-sidebar-label">CONVERSATIONS</span>{loading ? <span className="ai-sidebar-muted">Loading…</span> : conversations.map((item) => <div className={`ai-conversation-item ${active?.id === item.id ? "active" : ""}`} key={item.id}><button type="button" onClick={() => setActive(item)}>{item.title || item.name || "New conversation"}</button><span><button type="button" onClick={() => void rename(item.id)} aria-label="Rename conversation">···</button><button type="button" onClick={() => void removeConversation(item.id)} aria-label="Delete conversation">×</button></span></div>)}</aside><div className="ai-chat-main"><div className="ai-chat-toolbar"><div><strong>{active?.title || "Conversation"}</strong><span>{connection === "connected" ? "Connected" : connection === "connecting" ? "Connecting…" : "Connection lost"}</span></div><span className={`ai-online-status ${connection !== "connected" ? "offline" : ""}`}><i /> {connection === "connected" ? "Ready" : connection}</span></div><div className="ai-chat-scroll" ref={scroll}>{historyLoading ? <div className="ai-sidebar-muted ai-centered">Loading messages…</div> : !messages.length ? <div className="ai-empty-state"><div className="ai-empty-icon"><Icon name="sparkles" size={28} /></div><h3>How can I help you today?</h3><p>Ask Mentify about your academy and get actionable insights.</p><SuggestedPrompts onSelect={send} /></div> : <div className="ai-message-list">{messages.map((message) => <ChatMessage message={message} key={message.id} />)}{processing && <div className="ai-typing"><span className="ai-chat-avatar"><Icon name="sparkles" size={15} /></span><span><i /><i /><i /></span><small>Mentify AI is thinking…</small></div>}</div>}{error && <div className="ai-chat-error" role="alert"><Icon name="alert" size={16} /><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}</div><div className="ai-chat-composer"><ChatInput disabled={!active || processing || connection !== "connected"} onSend={send} /><small>Mentify AI can make mistakes. Review important decisions before acting.</small></div></div></div></section>;
}
