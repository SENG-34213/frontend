"use client";
import { useEffect, useRef, useState } from "react";
import { studentApi, type Assignment, type Submission, type Course } from "../lib/studentApi";

function date(value?:string){return value&&!Number.isNaN(new Date(value).getTime())?new Date(value).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"No deadline";}
function latest(items:Submission[],id:string){return items.filter(s=>s.assignmentId===id).sort((a,b)=>(b.attemptNumber||0)-(a.attemptNumber||0)||(b.submittedAt||"").localeCompare(a.submittedAt||""))[0];}
function category(s?:Submission){return s?.status==="GRADED"||s?.marks!=null?"Graded & Returned":s&&s.status!=="DRAFT"?"Under Review":"To Do / In Progress";}
export default function StudentAssignments({courseIds,courses,onNavigate}:{courseIds:string[];courses:Course[];onNavigate:(view:"Materials"|"Messages"|"Calendar")=>void}){
 const [assignments,setAssignments]=useState<Assignment[]>([]),[submissions,setSubmissions]=useState<Submission[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[reload,setReload]=useState(0);
 const [filter,setFilter]=useState("All"),[selected,setSelected]=useState<Assignment|null>(null),[history,setHistory]=useState(false);
 const [loadedKey,setLoadedKey]=useState("");
 const key=courseIds.join("|");
 useEffect(()=>{let live=true;const ids=key?key.split("|"):[];
   void Promise.all([Promise.all(ids.map(async id=>(await studentApi.assignments(id)).map(a=>({...a,courseId:a.courseId||id})))),studentApi.submissions()])
    .then(([lists,items])=>{if(live){setAssignments([...new Map(lists.flat().map(a=>[a.id,a])).values()]);setSubmissions(items);setError("");}})
    .catch(e=>{if(live)setError(e instanceof Error?e.message:"Could not load assignments.");}).finally(()=>{if(live){setLoading(false);setLoadedKey(key);}});
   return()=>{live=false;};
 },[key,reload]);
 const refresh=()=>{setLoading(true);setReload(n=>n+1);};
 const visible=assignments.filter(a=>filter==="All"||category(latest(submissions,a.id))===filter);
 const graded=visible.filter(a=>category(latest(submissions,a.id))==="Graded & Returned");
 const active=visible.filter(a=>category(latest(submissions,a.id))!=="Graded & Returned");
 const due=assignments.filter(a=>a.dueDate&&new Date(a.dueDate)>=new Date()&&category(latest(submissions,a.id))==="To Do / In Progress").sort((a,b)=>new Date(a.dueDate!).getTime()-new Date(b.dueDate!).getTime()).slice(0,4);
 function card(a:Assignment){
   const s=latest(submissions,a.id),state=category(s);
   return <article className="sa-card" key={a.id}><header><span className="sa-tag">{courses.find(c=>c.id===a.courseId)?.courseName||"Course assignment"}</span><span className={state==="Graded & Returned"?"sa-grade":"sa-status"}>{state==="Graded & Returned"?`${s?.marks??"—"} / ${a.maxMarks??"—"}`:s?.status||"To do"}{state!=="Graded & Returned"&&` · ${date(a.dueDate)}`}</span></header><h3>{a.title}</h3><p>{a.description||"Review the instructions and prepare your submission."}</p>
    {a.instructions&&<details><summary>Assignment instructions</summary><p>{a.instructions}</p></details>}
    {state==="To Do / In Progress"&&<div className="sa-submission-source"><header><strong>▤ Submission workspace</strong><span>{s?"Draft saved":"Not started"}</span></header><p>{s?.content||"Prepare your response or project link, then review and submit your work."}</p><button className="sa-primary" onClick={()=>setSelected(a)}>{s?"Continue Your Draft":"Prepare Submission"} →</button></div>}
    <div className="sa-facts"><span>Maximum marks: {a.maxMarks??"Not specified"}</span><span>Attempts allowed: {a.allowedAttempts??"Not specified"}</span>{s&&<span>Attempt {s.attemptNumber??"—"}</span>}</div>
    {s?.feedback&&<section className="sa-feedback"><span>✧ Instructor feedback</span><p>{s.feedback}</p></section>}
    {s?.submittedAt&&<small className="sa-submitted">Submitted {date(s.submittedAt)}{s.isLate?" · Late submission":""}</small>}
    <footer><button onClick={()=>onNavigate("Materials")}>▤ Course materials</button><button className={state==="To Do / In Progress"?"sa-primary":""} onClick={()=>setSelected(a)}>{state==="To Do / In Progress"?s?"Continue Draft →":"Start Submission →":"View Submission"}</button></footer>
   </article>;
 }
 return <section className="sa-workspace"><header className="sa-hero"><small>Academic Portal › Assignments › <span>Course Deliverables</span></small><div><div><h1>Course Assignments &amp;<br/> Project Deliverables</h1><p>Manage your submissions, track upcoming deadlines, and review instructor feedback.</p></div><div className="sa-hero-actions"><button disabled={loading} onClick={()=>setHistory(true)}>◷ Submission History</button><button className="sa-primary" disabled={loading||!!error||!active.length} onClick={()=>setSelected(active[0])}>↥ Submit Your Work</button></div></div><nav aria-label="Assignment status">{["All","To Do / In Progress","Under Review","Graded & Returned"].map(tab=><button key={tab} aria-pressed={filter===tab} onClick={()=>setFilter(tab)}>{tab} ({loading?"…":assignments.filter(a=>tab==="All"||category(latest(submissions,a.id))===tab).length})</button>)}</nav></header>
 {notice&&<p className="sa-success" role="status">{notice}</p>}{error&&<div className="sa-error" role="alert">{error}<button onClick={refresh}>Retry</button></div>}
 <div className="sa-layout"><div>{loading||loadedKey!==key?<div className="sa-empty" role="status">Loading assignments and submissions…</div>:!error?<><div className="sa-section-title"><h2>♧ Active Deliverables</h2><small>{active.length} assignments</small></div>{active.map(card)}{!active.length&&<div className="sa-empty">No active assignments match this filter.</div>}<div className="sa-section-title"><h2>✧ Graded Assignments &amp; Teacher Feedback</h2></div>{graded.map(card)}{!graded.length&&<div className="sa-empty">Graded work and feedback will appear here.</div>}</>:null}</div>
 <aside className="sa-side"><section><h2>♧ Submission Protocol</h2><p>Review your instructor’s requirements before submitting your work.</p>{[["Save your progress","Save a draft and return to it before the deadline."],["Review before submitting","Check your content carefully. Submitted work is not editable here."],["Supported submission format","Text and links can be included in your response. File uploads and automated checks are not available."]].map(([title,text])=><div className="sa-rule" key={title}><strong>✓ {title}</strong><p>{text}</p></div>)}</section><section><h2>▣ Upcoming Deadlines</h2>{!loading&&due.map(a=><button className="sa-deadline" key={a.id} onClick={()=>setSelected(a)}><small>{date(a.dueDate)}</small><strong>{a.title}</strong></button>)}{!loading&&!due.length&&<p>No pending deadlines.</p>}<button onClick={()=>onNavigate("Calendar")}>Open Calendar →</button></section><section className="sa-help"><span className="sa-tag">COURSE SUPPORT</span><h2>Need help with the requirements?</h2><p>Ask your course group about instructions, deadlines, or submission requirements.</p><button className="sa-primary" onClick={()=>onNavigate("Messages")}>Open Course Messages →</button></section></aside></div>
 {selected&&<SubmissionEditor assignment={selected} existing={latest(submissions,selected.id)} onClose={()=>setSelected(null)} onSaved={(s,submitted)=>{setSubmissions(items=>[...items.filter(i=>i.id!==s.id),{...s,assignmentId:s.assignmentId||selected.id}]);setNotice(submitted?"Assignment submitted.":"Draft saved.");}}/>}
 {history&&<History assignments={assignments} submissions={submissions} onClose={()=>setHistory(false)}/>}
 </section>;
}
function SubmissionEditor({assignment,existing,onClose,onSaved}:{assignment:Assignment;existing?:Submission;onClose:()=>void;onSaved:(s:Submission,submitted:boolean)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),lock=useRef(false);
 const [content,setContent]=useState(existing?.content||""),[saved,setSaved]=useState(existing),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
 const readOnly=!!saved&&saved.status!=="DRAFT";
 const closed=assignment.status==="CLOSED"||assignment.status==="ARCHIVED"||(!!assignment.startDate&&new Date(assignment.startDate)>new Date())||(!!assignment.dueDate&&new Date(assignment.dueDate)<new Date()&&assignment.allowLateSubmission===false);
 async function save(submit:boolean){
  if(lock.current||readOnly||closed||!content.trim())return;
  lock.current=true;setBusy(true);setError("");setNotice("");
  try{const draft=saved?await studentApi.updateSubmission(saved.id,content.trim()):await studentApi.createSubmission(assignment.id,content.trim());setSaved(draft);
   onSaved({...draft,content:draft.content??content.trim()},false);
   const result=submit?await studentApi.submitAssignment(draft.id):draft;
   const complete={...draft,...result,content:result.content??draft.content??content.trim()};
   setSaved(complete);if(submit)onSaved(complete,true);setNotice(submit?"Submitted successfully.":"Draft saved.");
  }catch(e){setError(e instanceof Error?e.message:"Could not save your work.");}finally{lock.current=false;setBusy(false);}
 }
 return <dialog ref={dialog} className="sa-dialog" aria-labelledby="sa-editor-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><header><h2 id="sa-editor-title">{assignment.title}</h2><button disabled={busy} onClick={onClose} aria-label="Close submission">×</button></header><p>{assignment.instructions||assignment.description}</p><p className="sa-submitted">Deadline: {date(assignment.dueDate)}</p>{closed&&!readOnly&&<p className="sa-error">This assignment is not currently accepting submissions.</p>}<label>Your submission<textarea rows={9} value={content} readOnly={readOnly||closed} disabled={busy} onChange={e=>setContent(e.target.value)} placeholder="Write your response or include a link to your work…"/></label>{saved?.feedback&&<section className="sa-feedback"><strong>Instructor feedback</strong><p>{saved.feedback}</p></section>}{error&&<p className="sa-error" role="alert">{error}</p>}{notice&&<p className="sa-success" role="status">{notice}</p>}<footer><button disabled={busy} onClick={onClose}>Close</button>{!readOnly&&!closed&&<><button disabled={busy||!content.trim()} onClick={()=>void save(false)}>Save Draft</button><button className="sa-primary" disabled={busy||!content.trim()} onClick={()=>void save(true)}>{busy?"Saving…":"Submit Assignment"}</button></>}</footer></dialog>;
}
function History({assignments,submissions,onClose}:{assignments:Assignment[];submissions:Submission[];onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
 return <dialog ref={dialog} className="sa-dialog" aria-labelledby="sa-history-title" onCancel={onClose}><header><h2 id="sa-history-title">Submission History</h2><button onClick={onClose} aria-label="Close history">×</button></header>{submissions.length?submissions.map(s=><article className="sa-history-row" key={s.id}><strong>{assignments.find(a=>a.id===s.assignmentId)?.title||"Assignment submission"}</strong><p>{s.status||"Status unavailable"} · Attempt {s.attemptNumber??"—"} · {s.submittedAt?date(s.submittedAt):"Not yet submitted"}</p>{s.marks!=null&&<span>Marks: {s.marks}</span>}</article>):<p>No submissions yet.</p>}</dialog>;
}
