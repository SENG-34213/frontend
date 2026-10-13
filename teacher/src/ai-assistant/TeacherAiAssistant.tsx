"use client";
import { useEffect, useRef, useState } from "react";
import { conversations, create, messages, sendDestination, subscription, wsUrl, type Conversation, type Message } from "./aiAssistantService";
const tools = [
  ["✦","Lesson Plan Architect","Create a structured lesson plan with objectives, activities, differentiation, and an exit ticket."],
  ["▤","Rubric & Assessment Engine","Help me design a clear assessment rubric with criteria and performance levels."],
  ["⚑","IEP & Differentiation","Suggest inclusive differentiated teaching activities. Ask me about the learners’ needs first."],
];
function frame(command:string,headers:Record<string,string>,body=""){return command+"\n"+Object.entries(headers).map(([k,v])=>k+":"+v).join("\n")+"\n\n"+body+"\0";}
export default function TeacherAiAssistant(){
 const [items,setItems]=useState<Conversation[]>([]),[active,setActive]=useState<Conversation|null>(null),[list,setList]=useState<Message[]>([]);
 const [input,setInput]=useState(""),[search,setSearch]=useState(""),[status,setStatus]=useState("Connecting…"),[error,setError]=useState("");
 const [busy,setBusy]=useState(false),[creating,setCreating]=useState(false),[loading,setLoading]=useState(true),[historyLoading,setHistoryLoading]=useState(false),[retry,setRetry]=useState(0);
 const [selectedTool,setSelectedTool]=useState("Lesson Plan Architect"),[notice,setNotice]=useState("");
 const ws=useRef<WebSocket|null>(null),activeId=useRef<string|undefined>(undefined),pending=useRef<string|undefined>(undefined),end=useRef<HTMLDivElement>(null);
 const artifact=[...list].reverse().find(m=>m.role==="ASSISTANT");
 useEffect(()=>{let live=true;void conversations().then(data=>{if(live){setItems(data);setActive(data[0]||null);}}).catch(e=>{if(live)setError(e instanceof Error?e.message:"Could not load conversations.");}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[]);
 useEffect(()=>{activeId.current=active?.id;if(!active)return;let live=true;
   void messages(active.id).then(data=>{if(live)setList(data);}).catch(e=>{if(live)setError(e instanceof Error?e.message:"Could not load history.");}).finally(()=>{if(live)setHistoryLoading(false);});
   return()=>{live=false;};
 },[active]);
 useEffect(()=>{
   let live=true,buffer="";const token=sessionStorage.getItem("mentify_access_token");
   if(!token)return;
   const socket=new WebSocket(wsUrl());ws.current=socket;
   socket.onopen=()=>socket.send(frame("CONNECT",{"accept-version":"1.2",Authorization:"Bearer "+token}));
   socket.onmessage=event=>{
     buffer+=String(event.data).replace(/\r\n/g,"\n");const frames=buffer.split("\0");buffer=frames.pop()||"";
     for(const raw of frames){const text=raw.replace(/^\n+/,""),split=text.indexOf("\n\n");if(split<0)continue;const command=text.slice(0,split).split("\n")[0];
       if(command==="CONNECTED"){setStatus("Connected");socket.send(frame("SUBSCRIBE",{id:"teacher-ai",destination:subscription}));continue;}
       if(command==="ERROR"){setError("The AI connection was rejected. Please reconnect.");setBusy(false);pending.current=undefined;continue;}
       if(command!=="MESSAGE")continue;
       let data:Record<string,unknown>;try{data=JSON.parse(text.slice(split+2));}catch{continue;}
       const id=String(data.conversationId||pending.current||"");if(id&&id!==activeId.current)continue;
       const type=String(data.type||data.status||"").toUpperCase();
       if(type==="ERROR"){setError(String(data.message||"Could not generate a response."));setBusy(false);pending.current=undefined;}
       if(type==="COMPLETED"||type==="COMPLETE"){const current=activeId.current;pending.current=undefined;
         if(current)void messages(current).then(data=>{if(live&&current===activeId.current)setList(data);}).catch(()=>{if(live)setError("Response received but history could not refresh. Reopen this conversation.");}).finally(()=>{if(live)setBusy(false);});
       }
     }
   };
   socket.onerror=()=>{if(live)setError("Could not connect to Mentify AI.");};
   socket.onclose=()=>{if(live){setStatus("Disconnected");setBusy(false);pending.current=undefined;}};
   return()=>{live=false;socket.close();};
 },[retry]);
 useEffect(()=>{end.current?.scrollIntoView({block:"nearest"});},[list,busy]);
 async function newChat(){if(creating||busy)return;setCreating(true);setError("");try{const item=await create();setItems(v=>[item,...v]);setList([]);setInput("");setActive(item);}catch(e){setError(e instanceof Error?e.message:"Could not create conversation.");}finally{setCreating(false);}}
 function open(item:Conversation){if(busy)return;setHistoryLoading(true);setList([]);setInput("");setError("");setActive({...item});}
 function send(){const text=input.trim();if(!text||!active||busy||historyLoading||status!=="Connected"||ws.current?.readyState!==WebSocket.OPEN)return;
   setError("");pending.current=active.id;setBusy(true);
   try{ws.current.send(frame("SEND",{destination:sendDestination,"content-type":"application/json"},JSON.stringify({conversationId:active.id,message:text})));setList(v=>[...v,{id:crypto.randomUUID(),role:"USER",content:text}]);setInput("");}catch{pending.current=undefined;setBusy(false);setError("Message could not be sent. Your draft has been preserved.");}
 }
 function download(){if(!artifact)return;const url=URL.createObjectURL(new Blob([artifact.content],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="mentify-teaching-draft.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="ta-workspace"><header className="ta-heading"><div><small>TEACHER PORTAL › AI &amp; COMMUNICATION › MENTIFY AI ASSISTANT</small><h1>Mentify AI Teaching Assistant <span>✧ Copilot</span></h1><p>Lesson planning · Assessment support · Differentiated teaching</p></div><div><button disabled={!artifact} onClick={download}>↓ Export Draft</button><button className="ta-primary" disabled={creating||busy} onClick={()=>void newChat()}>＋ {creating?"Creating…":"New Thread"}</button></div></header>
 {error&&<p className="ta-error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <div className="ta-layout"><aside className="ta-library"><button className="ta-primary ta-full" disabled={creating||busy} onClick={()=>void newChat()}>✦ New Conversation</button><input aria-label="Search conversations" placeholder="Search prompts & chats…" value={search} onChange={e=>setSearch(e.target.value)}/><h3>SPECIALIZED COPILOTS</h3>{tools.map(([icon,title,prompt])=><button className={selectedTool===title?"ta-tool selected":"ta-tool"} key={title} disabled={busy} onClick={()=>{setSelectedTool(title);setInput(prompt);}}>{icon} {title}</button>)}<h3>CONVERSATIONS</h3>{loading?<p role="status">Loading conversations…</p>:items.filter(i=>(i.title||i.name||"").toLowerCase().includes(search.toLowerCase())).map(item=><button disabled={busy} className={active?.id===item.id?"ta-thread selected":"ta-thread"} key={item.id} onClick={()=>open(item)}>▢ {item.title||item.name||"New conversation"}</button>)}{!loading&&!items.length&&<p>No conversations yet. Start a new thread.</p>}<div className="ta-library-note"><strong>Your teaching workspace</strong><p>Review generated content before sharing it with students.</p></div></aside>
 <section className="ta-chat"><header><div><strong>{active?.title||active?.name||"Teaching Copilot"}</strong><small>{selectedTool}</small></div><span className={status==="Connected"?"ta-connected":""}>● {status}</span>{status!=="Connected"&&<button onClick={()=>{setStatus("Connecting…");setRetry(n=>n+1);}}>Reconnect</button>}</header><div className="ta-grounding">✧ Share the course, topic, and learning objectives in your prompt for a more useful draft.</div>
 <div className="ta-messages">{historyLoading?<p role="status">Loading conversation…</p>:!list.length?<div className="ta-welcome"><span>✦</span><h2>What will you create today?</h2><p>Build a lesson, develop a rubric, or explore new ways to support your students.</p>{tools.map(([icon,title,prompt])=><button key={title} onClick={()=>{setInput(prompt);setSelectedTool(title);}}>{icon} {title} →</button>)}{!active&&<p>Create a conversation to start chatting.</p>}</div>:list.map(m=><article className={m.role==="USER"?"ta-message user":"ta-message"} key={m.id}><small>{m.role==="USER"?"You":"✦ Mentify Copilot"}</small><div>{m.content}</div></article>)}{busy&&<p className="ta-thinking" role="status">✦ Preparing your teaching draft…</p>}<div ref={end}/></div>
 <form className="ta-composer" onSubmit={e=>{e.preventDefault();send();}}><span>✧ {selectedTool}</span><textarea aria-label="Message Mentify AI" rows={3} maxLength={12000} value={input} disabled={busy} onChange={e=>setInput(e.target.value)} placeholder="Ask Mentify Copilot to build lesson plans, grading keys, email drafts, or differentiated assignments…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send();}}}/><footer><small>Shift + Enter for a new line</small><button className="ta-primary" disabled={!active||busy||historyLoading||!input.trim()||status!=="Connected"}>Send ➤</button></footer></form><p className="ta-disclaimer">AI can make mistakes. Verify academic content and avoid sharing unnecessary student information.</p></section>
 <aside className="ta-artifacts"><header><h2>▤ Generated Draft</h2><span>{artifact?"Ready to review":"No draft yet"}</span></header><div className="ta-artifact-card"><small>TEACHING RESOURCE</small><h3>{selectedTool}</h3>{artifact?<div className="ta-artifact-preview">{artifact.content}</div>:<div className="ta-artifact-empty"><span>✧</span><p>Your latest AI response will appear here for review and export.</p></div>}</div><h3>DRAFT ACTIONS</h3><button disabled={!artifact} onClick={()=>void navigator.clipboard.writeText(artifact?.content||"").then(()=>setNotice("Draft copied.")).catch(()=>setNotice("Could not copy. Use Export Draft instead."))}>▢ Copy draft</button><button disabled={!artifact} onClick={download}>↓ Export text file</button><div className="ta-info"><strong>Review before publishing</strong><p>Direct LMS publishing, document grounding, and model settings aren’t available through the current AI service.</p></div></aside></div></section>;
}
