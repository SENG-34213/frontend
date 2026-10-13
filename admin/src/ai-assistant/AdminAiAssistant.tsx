"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
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
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [tool, setTool] = useState("Academic Insights");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const artifact = [...messages].reverse().find(item => item.role === "ASSISTANT");
  const prompts = [
    ["Academic Insights", "Help me analyze academic performance. Ask which course and date range to review."],
    ["Scheduling Assistant", "Help me draft a scheduling plan. Ask about capacity, availability, and constraints."],
    ["Communication Drafts", "Help me draft an academy announcement. Ask about the audience and purpose first."],
  ];
  function exportDraft() { if (!artifact) return; const url = URL.createObjectURL(new Blob([artifact.content], {type:"text/plain;charset=utf-8"})); const link=document.createElement("a"); link.href=url; link.download="mentify-admin-draft.txt"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  const stompClient = useRef<Client | null>(null);
  const subscription = useRef<StompSubscription | undefined>(undefined);
  const activeIdRef = useRef<string | undefined>(undefined);
  const pendingResponseRef = useRef<{ conversationId: string; assistantCount: number } | null>(null);
  const unmounting = useRef(false);
  const scroll = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => { setLoading(true); try { const items = await listConversations(apiRequest); setConversations(items); if (items[0]) setActive(items[0]); } catch (e) { setError(e instanceof Error ? e.message : "Could not load your conversations."); } finally { setLoading(false); } }, [apiRequest]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { activeIdRef.current = active?.id; if (pendingResponseRef.current && pendingResponseRef.current.conversationId !== active?.id) pendingResponseRef.current = null; }, [active]);
  useEffect(() => { if (!active) { setMessages([]); return; } let cancelled = false; setMessages([]); setHistoryLoading(true); void listMessages(apiRequest, active.id).then((items) => { if (!cancelled) setMessages(items); }).catch(() => { if (!cancelled) setError("Could not load this conversation."); }).finally(() => { if (!cancelled) setHistoryLoading(false); }); return () => { cancelled = true; }; }, [active, apiRequest]);

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
    return () => { pendingResponseRef.current = null; unmounting.current = true; subscription.current?.unsubscribe(); subscription.current = undefined; stompClient.current = null; void client.deactivate(); };
  }, [apiRequest, apiUrl, token]);
  useEffect(() => { const node = scroll.current; if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" }); }, [messages, processing]);

  async function newChat() { if (creating || processing) return; setCreating(true); setError(""); try { const conversation = await createConversation(apiRequest); setConversations((items) => [conversation, ...items]); setActive(conversation); setMessages([]); setDraft(""); } catch { setError("Could not create a new conversation."); } finally { setCreating(false); } }
  async function removeConversation(id: string) { if (processing || !window.confirm("Delete this conversation? This cannot be undone.")) return; try { await deleteConversation(apiRequest, id); const next = conversations.filter((item) => item.id !== id); setConversations(next); setActive(active?.id === id ? next[0] ?? null : active); } catch { setError("Could not delete this conversation."); } }
  async function rename(id: string) { const current = conversations.find((item) => item.id === id); const title = window.prompt("Conversation name", current?.title || "New conversation"); if (!title?.trim()) return; try { const updated = await renameConversation(apiRequest, id, title.trim()); setConversations((items) => items.map((item) => item.id === id ? updated : item)); if (active?.id === id) setActive(updated); } catch { setError("Could not rename this conversation."); } }
  async function reconcileResponse(conversationId: string, assistantCount: number) { for (let attempt = 0; attempt < 60 && pendingResponseRef.current?.conversationId === conversationId; attempt += 1) { await new Promise((resolve) => window.setTimeout(resolve, 1000)); if (pendingResponseRef.current?.conversationId !== conversationId) return; try { const items = await listMessages(apiRequest, conversationId); const assistantMessages = items.filter((item: Message) => item.role === "ASSISTANT"); if (assistantMessages.length > assistantCount) { pendingResponseRef.current = null; setMessages(items); setProcessing(false); return; } } catch { /* The STOMP response may still arrive; keep waiting. */ } } if (pendingResponseRef.current?.conversationId === conversationId) { pendingResponseRef.current = null; setProcessing(false); setError("Mentify AI is taking longer than expected. Try sending the question again."); } }
  function send(content: string) { const message = content.trim(); const conversationId = active?.id; if (!message || !conversationId || !stompClient.current?.connected || processing) return; const clientMessageId = crypto.randomUUID(); const assistantCount = messages.filter((item) => item.role === "ASSISTANT").length; pendingResponseRef.current = { conversationId, assistantCount }; setMessages((items) => [...items, { id: `local-${clientMessageId}`, role: "USER", content: message, createdAt: new Date().toISOString() }]); setProcessing(true); stompClient.current.publish({ destination: "/app/ai/chat", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ conversationId, message, clientMessageId }) }); void reconcileResponse(conversationId, assistantCount); }

  return <section className="aa-workspace">
    <header className="aa-heading"><div><small>ADMIN PORTAL › AI &amp; COMMUNICATION › MENTIFY AI ASSISTANT</small><h1>Mentify AI Administrative Assistant <span>✧ Copilot</span></h1><p>Academic insights · Scheduling support · Communication drafts</p></div><div><button disabled={!artifact} onClick={exportDraft}>↓ Export Draft</button><button className="aa-primary" disabled={creating || processing} onClick={()=>void newChat()}>＋ {creating?"Creating…":"New Thread"}</button></div></header>
    {error&&<p className="aa-error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
    <div className="aa-layout"><aside className="aa-library"><button className="aa-primary aa-full" disabled={creating||processing} onClick={()=>void newChat()}>✦ New Conversation</button><input aria-label="Search conversations" placeholder="Search prompts & chats…" value={query} onChange={e=>setQuery(e.target.value)}/><h3>SPECIALIZED COPILOTS</h3>{prompts.map(([title,prompt])=><button disabled={processing} className={tool===title?"aa-tool selected":"aa-tool"} key={title} onClick={()=>{setTool(title);setDraft(prompt);}}>✧ {title}</button>)}<h3>ADMIN CONVERSATIONS</h3>{loading?<p role="status">Loading conversations…</p>:conversations.filter(item=>(item.title||item.name||"").toLowerCase().includes(query.toLowerCase())).map(item=><div className="aa-thread-row" key={item.id}><button disabled={processing} className={active?.id===item.id?"aa-thread selected":"aa-thread"} onClick={()=>{setDraft("");setError("");setActive({...item});}}>▢ {item.title||item.name||"New conversation"}</button><button disabled={processing} aria-label="Rename conversation" onClick={()=>void rename(item.id)}>✎</button><button disabled={processing} aria-label="Delete conversation" onClick={()=>void removeConversation(item.id)}>×</button></div>)}{!loading&&!conversations.length&&<p>No conversations yet. Start a new thread.</p>}<div className="aa-library-note"><strong>Your admin workspace</strong><p>Review generated recommendations before taking action.</p></div></aside>
    <section className="aa-chat"><header><div><strong>{active?.title||"Administrative Copilot"}</strong><small>{tool}</small></div><span className={connection==="connected"?"aa-connected":""}>● {connection}</span></header><div className="aa-grounding">✧ Specify the course, date range, and administrative context in your prompt.</div><div className="aa-messages" ref={scroll}>{historyLoading?<p role="status">Loading conversation…</p>:!messages.length?<div className="aa-welcome"><span>✦</span><h2>How can I help your academy?</h2><p>Explore academic questions, plan schedules, or prepare communications.</p>{prompts.map(([title,prompt])=><button key={title} onClick={()=>{setTool(title);setDraft(prompt);}}>✧ {title} →</button>)}{!active&&<p>Create a conversation to get started.</p>}</div>:messages.map(message=><article className={message.role==="USER"?"aa-message user":"aa-message"} key={message.id}><small>{message.role==="USER"?"You":message.role==="SYSTEM"?"System":"✦ Mentify Copilot"}</small><div>{message.content}</div></article>)}{processing&&<p className="aa-thinking" role="status">✦ Preparing your response…</p>}</div>
    <form className="aa-composer" onSubmit={e=>{e.preventDefault();if(active&&!processing&&!historyLoading&&connection==="connected"&&draft.trim()){send(draft);setDraft("");}}}><span>✧ {tool}</span><textarea aria-label="Message Mentify AI" rows={3} maxLength={12000} disabled={processing} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask about students, courses, attendance, or academy activity…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}}/><footer><small>Shift + Enter for a new line</small><button className="aa-primary" disabled={!active||processing||historyLoading||!draft.trim()||connection!=="connected"}>Send ➤</button></footer></form><p className="aa-disclaimer">AI can make mistakes. Verify recommendations and avoid sharing unnecessary personal information.</p></section>
    <aside className="aa-artifacts"><header><h2>▤ Generated Draft</h2><span>{artifact?"Ready to review":"No draft yet"}</span></header><div className="aa-artifact-card"><small>ADMINISTRATIVE RESOURCE</small><h3>Latest response</h3>{artifact?<div className="aa-artifact-preview">{artifact.content}</div>:<div className="aa-artifact-empty"><span>✧</span><p>Your latest AI response will appear here for review and export.</p></div>}</div><h3>DRAFT ACTIONS</h3><button disabled={!artifact} onClick={()=>void navigator.clipboard.writeText(artifact?.content||"").then(()=>setNotice("Draft copied.")).catch(()=>setNotice("Could not copy. Use Export Draft instead."))}>▢ Copy draft</button><button disabled={!artifact} onClick={exportDraft}>↓ Export text file</button><div className="aa-info"><strong>Review before acting</strong><p>Generated drafts do not execute administrative actions. Automated publishing and model settings are not exposed by the current AI service.</p></div></aside></div>
  </section>;
}
