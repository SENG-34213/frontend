"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { Icon } from "@/components/admin/Icon";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import {
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  renameConversation,
  type AuthorizedApiRequest,
  type ChatMessage as Message,
  type Conversation,
} from "./service/aiAssistantService";

type Props = { apiRequest: AuthorizedApiRequest; apiUrl?: string; token?: string };
type AiSocketPayload = {
  status?: string;
  message?: string;
  conversationId?: string;
  data?: {
    status?: string;
    messageId?: string;
    conversationId?: string;
    content?: string;
    message?: string;
  };
};
export function AdminAiAssistant({
  apiRequest,
  apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  token: authToken = "",
}: Props) {
  const token =
    authToken ||
    (typeof window !== "undefined" ? sessionStorage.getItem("mentify_access_token") || "" : "");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("connecting");
  const [maximized, setMaximized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const stompClient = useRef<Client | null>(null);
  const subscription = useRef<StompSubscription | undefined>(undefined);
  const activeIdRef = useRef<string | undefined>(undefined);
  const pendingResponseRef = useRef<{ conversationId: string; assistantCount: number } | null>(
    null,
  );
  const unmounting = useRef(false);
  const scroll = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listConversations(apiRequest);
      setConversations(items);
      if (items[0]) setActive(items[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your conversations.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    activeIdRef.current = active?.id;
    if (pendingResponseRef.current && pendingResponseRef.current.conversationId !== active?.id)
      pendingResponseRef.current = null;
  }, [active]);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setHistoryLoading(true);
    void listMessages(apiRequest, active.id)
      .then((items) => {
        if (!cancelled) setMessages(items);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this conversation.");
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, apiRequest]);

  useEffect(() => {
    if (!token) {
      setConnection("disconnected");
      return;
    }
    unmounting.current = false;
    const client = new Client({
      brokerURL:
        process.env.NEXT_PUBLIC_AI_WS_URL ||
        `${apiUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ws/ai`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnection("connected");
        setError("");
        subscription.current = client.subscribe("/user/queue/ai/chat", (frame: IMessage) => {
          let payload: AiSocketPayload;
          try {
            payload = JSON.parse(frame.body) as AiSocketPayload;
          } catch {
            setProcessing(false);
            setError("Mentify AI returned an unreadable response.");
            return;
          }
          const status = String(payload.status || payload.data?.status || "")
            .trim()
            .toUpperCase();
          if (status === "PROCESSING") setProcessing(true);
          else if (status === "ERROR") {
            pendingResponseRef.current = null;
            setProcessing(false);
            setError(payload.message || "Mentify AI could not complete that request.");
          } else if (status === "COMPLETED") {
            pendingResponseRef.current = null;
            setProcessing(false);
            const conversationId =
              payload.conversationId || payload.data?.conversationId || activeIdRef.current;
            const answer = payload.data?.message || payload.data?.content;
            if (conversationId && answer && conversationId === activeIdRef.current) {
              setMessages((current) => {
                const messageId = payload.data?.messageId || `assistant-${Date.now()}`;
                if (
                  current.some(
                    (item) =>
                      item.id === messageId ||
                      (item.role === "ASSISTANT" && item.content === answer),
                  )
                )
                  return current;
                return [
                  ...current,
                  {
                    id: messageId,
                    role: "ASSISTANT",
                    content: answer,
                    createdAt: new Date().toISOString(),
                  },
                ];
              });
            } else if (conversationId) {
              void listMessages(apiRequest, conversationId)
                .then((items) => {
                  if (conversationId === activeIdRef.current) setMessages(items);
                })
                .catch(() =>
                  setError(
                    "The response was generated, but the conversation could not be refreshed.",
                  ),
                );
            }
          }
        });
      },
      onStompError: () => {
        if (!unmounting.current) {
          setConnection("disconnected");
          setProcessing(false);
          setError("Mentify AI connection was rejected. Please sign in again.");
        }
      },
      onWebSocketClose: () => {
        if (!unmounting.current) setConnection("disconnected");
      },
      onWebSocketError: () => {
        if (!unmounting.current) setConnection("disconnected");
      },
    });
    stompClient.current = client;
    client.activate();
    return () => {
      unmounting.current = true;
      subscription.current?.unsubscribe();
      subscription.current = undefined;
      stompClient.current = null;
      void client.deactivate();
    };
  }, [apiRequest, apiUrl, token]);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, processing]);

  async function newChat() {
    try {
      const conversation = await createConversation(apiRequest);
      setConversations((items) => [conversation, ...items]);
      setActive(conversation);
      setMessages([]);
    } catch {
      setError("Could not create a new conversation.");
    }
  }
  async function removeConversation(id: string) {
    try {
      await deleteConversation(apiRequest, id);
      const next = conversations.filter((item) => item.id !== id);
      setConversations(next);
      setActive(active?.id === id ? (next[0] ?? null) : active);
    } catch {
      setError("Could not delete this conversation.");
    }
  }
  async function rename(id: string) {
    const current = conversations.find((item) => item.id === id);
    const title = window.prompt("Conversation name", current?.title || "New conversation");
    if (!title?.trim()) return;
    try {
      const updated = await renameConversation(apiRequest, id, title.trim());
      setConversations((items) => items.map((item) => (item.id === id ? updated : item)));
      if (active?.id === id) setActive(updated);
    } catch {
      setError("Could not rename this conversation.");
    }
  }
  async function reconcileResponse(conversationId: string, assistantCount: number) {
    for (
      let attempt = 0;
      attempt < 60 && pendingResponseRef.current?.conversationId === conversationId;
      attempt += 1
    ) {
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
      if (pendingResponseRef.current?.conversationId !== conversationId) return;
      try {
        const items = await listMessages(apiRequest, conversationId);
        const assistantMessages = items.filter((item: Message) => item.role === "ASSISTANT");
        if (assistantMessages.length > assistantCount) {
          pendingResponseRef.current = null;
          setMessages(items);
          setProcessing(false);
          return;
        }
      } catch {
        /* The STOMP response may still arrive; keep waiting. */
      }
    }
    if (pendingResponseRef.current?.conversationId === conversationId) {
      pendingResponseRef.current = null;
      setProcessing(false);
      setError("Mentify AI is taking longer than expected. Try sending the question again.");
    }
  }
  function send(content: string) {
    const message = content.trim();
    const conversationId = active?.id;
    if (!message || !conversationId || !stompClient.current?.connected || processing) return;
    const clientMessageId = crypto.randomUUID();
    const assistantCount = messages.filter((item) => item.role === "ASSISTANT").length;
    pendingResponseRef.current = { conversationId, assistantCount };
    setMessages((items) => [
      ...items,
      {
        id: `local-${clientMessageId}`,
        role: "USER",
        content: message,
        createdAt: new Date().toISOString(),
      },
    ]);
    setProcessing(true);
    stompClient.current.publish({
      destination: "/app/ai/chat",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId, message, clientMessageId }),
    });
    void reconcileResponse(conversationId, assistantCount);
  }

  return (
    <section
      className={`ai-assistant ${maximized ? "is-maximized" : ""} ${sidebarOpen ? "" : "is-sidebar-closed"}`}
    >
      <div className="ai-assistant-heading">
        <div className="ai-assistant-title-wrap">
          <div className="ai-title-mark">
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <span className="catalog-kicker">MENTIFY INTELLIGENCE</span>
            <h2>Mentify AI Administrative Copilot</h2>
            <p>
              Operational intelligence for retention, scheduling, compliance, and academy growth.
            </p>
            <div className="ai-figma-status">
              <span>● Enterprise Core v4.2</span>
              <span>● Online</span>
              <small>Fine-tuned on institutional telemetry</small>
            </div>
          </div>
        </div>
        <div className="ai-assistant-actions">
          <button type="button" className="secondary-button ai-model-button">
            <Icon name="settings" size={13} /> Model Settings
          </button>
          <button type="button" className="secondary-button ai-export-button">
            ⇧ Export Log
          </button>
          <button type="button" className="primary-button" onClick={() => void newChat()}>
            <Icon name="plus" size={15} /> New Session
          </button>
          <button
            type="button"
            className="secondary-button ai-expand-button"
            onClick={() => setMaximized((current) => !current)}
            aria-label={maximized ? "Minimize AI assistant" : "Maximize AI assistant"}
            title={maximized ? "Minimize" : "Maximize"}
          >
            {maximized ? "↙ Minimize" : "⛶ Maximize"}
          </button>
        </div>
      </div>
      <div className="ai-trust-row">
        <span>
          <i>
            <Icon name="shield" size={12} />
          </i>{" "}
          Private to your workspace
        </span>
        <span>
          <i>
            <Icon name="check" size={12} />
          </i>{" "}
          Connected to live academy data
        </span>
        <span className="ai-trust-spacer" />
      </div>
      <div className={`ai-chat-panel ai-chat-layout ${sidebarOpen ? "" : "is-sidebar-closed"}`}>
        <aside className="ai-conversation-sidebar">
          <div className="ai-sidebar-intro">
            <span className="ai-sidebar-eyebrow">
              AUTOMATED PIPELINES <b>CRON ACTIVE</b>
            </span>
            <strong>Administrative workflows</strong>
            <small>Always-on intelligence for your academy</small>
          </div>
          <div className="ai-pipeline-list">
            <div>
              <strong>Academic At-Risk Audit</strong>
              <small>Scans 4,200 gradebooks &amp; flag dropouts</small>
              <b>Every Mon</b>
            </div>
            <div>
              <strong>Tutor Capacity Forecasting</strong>
              <small>Predicts AP exam demand surges</small>
              <b>Daily 08:00</b>
            </div>
            <div>
              <strong>Curriculum Quiz Synthesis</strong>
              <small>Parses syllabus changes into question sets</small>
              <b>Bi-weekly</b>
            </div>
            <div>
              <strong>Billing Discrepancy Reconciler</strong>
              <small>Cross-checks Stripe records with logged hours</small>
              <b>Weekly</b>
            </div>
          </div>
          <button type="button" className="ai-new-chat" onClick={() => void newChat()}>
            <Icon name="plus" size={15} /> Start a new session
          </button>
          <span className="ai-sidebar-label">
            ADMIN THREADS <small>{conversations.length || 24} Archived</small>
          </span>
          {loading ? (
            <span className="ai-sidebar-muted">Loading…</span>
          ) : conversations.length ? (
            conversations.map((item) => (
              <div
                className={`ai-conversation-item ${active?.id === item.id ? "active" : ""}`}
                key={item.id}
              >
                <button type="button" onClick={() => setActive(item)}>
                  {item.title || item.name || "New conversation"}
                </button>
                <span>
                  <button
                    type="button"
                    onClick={() => void rename(item.id)}
                    aria-label="Rename conversation"
                  >
                    ···
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeConversation(item.id)}
                    aria-label="Delete conversation"
                  >
                    ×
                  </button>
                </span>
              </div>
            ))
          ) : (
            <div className="ai-sidebar-empty">
              <Icon name="sparkles" size={17} />
              <span>No conversations yet</span>
              <small>Your next insight starts here.</small>
            </div>
          )}
          <div className="ai-inference-status">
            <span>INFERENCE LATENCY</span>
            <strong>142ms</strong>
            <i />
            <small>
              Tokens: 18.4k / 128k <b>Verified RAG: OK</b>
            </small>
          </div>
        </aside>
        <div className="ai-chat-main">
          <div className="ai-chat-toolbar">
            <div className="ai-toolbar-title">
              <button
                className="ai-history-toggle"
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                aria-label={
                  sidebarOpen ? "Close conversation history" : "Open conversation history"
                }
                aria-expanded={sidebarOpen}
                title={sidebarOpen ? "Close conversation history" : "Open conversation history"}
              >
                <Icon name="chevron" size={17} />
              </button>
              <span className="ai-toolbar-avatar">
                <Icon name="sparkles" size={15} />
              </span>
              <div>
                <strong>{active?.title || "New conversation"}</strong>
                <span>
                  {connection === "connected"
                    ? "Mentify AI is ready to help"
                    : connection === "connecting"
                      ? "Connecting to Mentify AI…"
                      : "Connection lost"}
                </span>
              </div>
            </div>
            <span className={`ai-online-status ${connection !== "connected" ? "offline" : ""}`}>
              <i /> {connection === "connected" ? "Online" : connection}
            </span>
          </div>
          <div className="ai-chat-scroll" ref={scroll}>
            {historyLoading ? (
              <div className="ai-sidebar-muted ai-centered">Loading messages…</div>
            ) : !messages.length ? (
              <div className="ai-figma-overview">
                <div className="ai-privilege-card">
                  <span>
                    <Icon name="shield" size={16} />
                  </span>
                  <div>
                    <strong>Administrative Privileges Verified</strong>
                    <p>
                      Mentify AI has read-write telemetry over enrolled student records, billing
                      transactions, scheduling engines, and automated SMS communication queues.
                    </p>
                  </div>
                  <b>RBAC Level 4</b>
                </div>
                <div className="ai-sample-question">
                  <span>
                    Analyze student retention trends in AP Physics over the last 90 days and
                    identify students who missed 2+ consecutive sessions.
                  </span>
                  <small>Prompt ID: APRM-8921-OPS</small>
                </div>
                <div className="ai-sample-answer">
                  <div className="ai-sample-answer-heading">
                    <span>
                      <Icon name="sparkles" size={13} /> Mentify AI Copilot
                    </span>
                    <small>90-Day Telemetry Query · 10:41 AM</small>
                  </div>
                  <p>
                    I processed 1,420 student attendance logs across 8 AP Physics cohorts. Aggregate
                    student retention remains stable, but a localized drop-off occurred following
                    the Electromagnetism Unit Exam (Week 7).
                  </p>
                  <div className="ai-insight-grid">
                    <div>
                      <small>COHORT RETENTION</small>
                      <strong>
                        94.2% <em>+1.4% MoM</em>
                      </strong>
                      <span>AP Physics avg</span>
                    </div>
                    <div>
                      <small>CONSECUTIVE ABSENCES</small>
                      <strong className="danger">
                        4 <em>Critical flag</em>
                      </strong>
                      <span>≥ 2 missed classes</span>
                    </div>
                    <div>
                      <small>INTERVENTION URGENCY</small>
                      <strong>
                        &lt; 48 <em>High risk</em>
                      </strong>
                      <span>Predicted exam pass: 42%</span>
                    </div>
                  </div>
                  <div className="ai-flagged-roster">
                    <header>
                      <strong>
                        <Icon name="alert" size={12} /> Flagged Students: Consecutive Absence Roster
                      </strong>
                      <small>Dataset: Verified Enrolments</small>
                    </header>
                    <div className="ai-roster-head">
                      <span>STUDENT NAME</span>
                      <span>MISSED DATES</span>
                      <span>TUTOR ASSIGNED</span>
                      <span>SUGGESTED INTERVENTION</span>
                    </div>
                    {[
                      ["Julian Chen", "Apr 09, Apr 12", "Marcus Vance", "Guardian SMS Check-in"],
                      [
                        "Samantha Ruiz",
                        "Apr 10, Apr 14",
                        "Dr. Alan Thorne",
                        "Diagnostic Practice Drill",
                      ],
                      ["Mateo Morales", "Apr 07, Apr 11", "Sarah Jenkins", "Reschedule Substitute"],
                      ["Priya Patel", "Apr 08, Apr 13", "Marcus Vance", "Guardian SMS Check-in"],
                    ].map((row) => (
                      <div className="ai-roster-row" key={row[0]}>
                        {row.map((cell, index) => (
                          <span
                            className={index === 3 ? "action" : index === 1 ? "date" : ""}
                            key={cell}
                          >
                            {cell}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <span className="ai-operations-label">RECOMMENDED 1-CLICK OPERATIONS</span>
                  <div className="ai-operations">
                    <button
                      type="button"
                      onClick={() => send("Send automated check-in SMS to flagged students")}
                    >
                      ⌁ Send Automated Check-in SMS to Students
                    </button>
                    <button type="button" onClick={() => send("Reschedule with substitute mentor")}>
                      ↔ Reschedule with Substitute Mentor
                    </button>
                    <button
                      type="button"
                      onClick={() => send("Assign AI diagnostic practice drill")}
                    >
                      ▣ Assign AI Diagnostic Practice Drill
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-message-list">
                {messages.map((message) => (
                  <ChatMessage message={message} key={message.id} />
                ))}
                {processing && (
                  <div className="ai-typing">
                    <span className="ai-chat-avatar">
                      <Icon name="sparkles" size={15} />
                    </span>
                    <span>
                      <i />
                      <i />
                      <i />
                    </span>
                    <small>Mentify AI is thinking…</small>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="ai-chat-error" role="alert">
                <Icon name="alert" size={16} />
                <span>{error}</span>
                <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="ai-chat-composer">
            <ChatInput
              disabled={!active || processing || connection !== "connected"}
              onSend={send}
            />
            <small>Mentify AI can make mistakes. Review important decisions before acting.</small>
          </div>
        </div>
      </div>
    </section>
  );
}
