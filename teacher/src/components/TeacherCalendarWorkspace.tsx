"use client";

import { useEffect, useMemo, useState } from "react";
import { teacherApi, type CalendarEvent, type CalendarEventType, type TeacherCourse } from "../lib/teacherApi";
import CalendarEventEditor from "./CalendarEventEditor";

const types: CalendarEventType[] = ["CLASS", "MEETING", "EXAM", "QUIZ", "ASSIGNMENT", "ATTENDANCE", "HOLIDAY", "ADMIN", "CUSTOM"];
export function calendarDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function shift(date: Date, days: number) { const next=new Date(date); next.setDate(next.getDate()+days); return next; }
function occurs(event: CalendarEvent, day: Date) {
  const start=new Date(event.startDateTime), end=event.endDateTime?new Date(event.endDateTime):start;
  return start<shift(day,1)&&(end>day||start.getTime()===day.getTime());
}
export default function TeacherCalendarWorkspace({courses}:{courses:TeacherCourse[]}) {
  const [selected,setSelected]=useState(()=>calendarDate(new Date()));
  const [view,setView]=useState<"Week"|"Day"|"List">("Week");
  const [course,setCourse]=useState("");
  const [kind,setKind]=useState("");
  const [status,setStatus]=useState("");
  const [query,setQuery]=useState("");
  const [reload,setReload]=useState(0);
  const [result,setResult]=useState<{key:string;events:CalendarEvent[];error:string}>({key:"",events:[],error:""});
  const [editing,setEditing]=useState<CalendarEvent|null|undefined>(undefined);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const range=useMemo(()=>{const start=new Date(`${selected}T00:00:00`);if(view!=="Day")start.setDate(start.getDate()-((start.getDay()+6)%7));return {start,end:shift(start,view==="Day"?1:7)};},[selected,view]);
  const key=`${range.start.toISOString()}/${range.end.toISOString()}/${course}/${reload}`;
  useEffect(()=>{
    let active=true;
    void teacherApi.calendarEvents(range.start.toISOString(),range.end.toISOString(),course||undefined)
      .then(events=>{if(active)setResult({key,events:events.sort((a,b)=>new Date(a.startDateTime).getTime()-new Date(b.startDateTime).getTime()),error:""});})
      .catch(caught=>{if(active)setResult({key,events:[],error:caught instanceof Error?caught.message:"Could not load calendar events."});});
    return ()=>{active=false;};
  },[key,range,course]);
  const loading=result.key!==key;
  const events=loading?[]:result.events;
  const visible=events.filter(e=>(!kind||e.eventType===kind)&&(!status||e.status===status)&&`${e.title} ${e.description||""} ${e.location||""}`.toLowerCase().includes(query.toLowerCase()));
  const days=Array.from({length:view==="Day"?1:7},(_,i)=>shift(range.start,i));
  async function cancel(event:CalendarEvent) {
    if(!event.canCancel||busy||!window.confirm(`Cancel “${event.title}”?`))return;
    setBusy(true);setError("");setNotice("");
    try{await teacherApi.cancelCalendarEvent(event.id);setReload(n=>n+1);setNotice("Event cancelled.");}
    catch(caught){setError(caught instanceof Error?caught.message:"Could not cancel event.");}finally{setBusy(false);}
  }
  function card(event:CalendarEvent) {return <article key={event.id} className={`tc-event tc-${event.eventType.toLowerCase()} ${event.status==="CANCELLED"?"tc-cancelled":""}`}>
    <small>{event.allDay?"ALL DAY":new Date(event.startDateTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} · {event.eventType}</small><h3>{event.title}</h3>
    <p>{event.location||courses.find(c=>c.id===event.courseId)?.courseName||event.description}</p><span>{event.status}</span>
    <footer>{event.canEdit&&event.status!=="CANCELLED"&&<button disabled={busy} onClick={()=>setEditing(event)} aria-label={`Edit ${event.title}`}>Edit</button>}{event.canCancel&&event.status!=="CANCELLED"&&<button disabled={busy} onClick={()=>void cancel(event)} aria-label={`Cancel ${event.title}`}>Cancel</button>}</footer>
  </article>;}
  return <section className="tc-workspace" aria-labelledby="tc-title">
    <header className="tc-hero"><div><small>TEACHER PORTAL • SESSIONS &amp; CALENDAR</small><h1 id="tc-title">Sessions &amp; Academic Calendar</h1><p>Plan your teaching week, manage course events, and keep students up to date.</p></div><button className="tc-primary" onClick={()=>setEditing(null)}>＋ Schedule Event</button></header>
    <div className="tc-metrics">{[["SELECTED RANGE",events.length],["SCHEDULED",events.filter(e=>e.status==="SCHEDULED").length],["EXAMS & QUIZZES",events.filter(e=>["EXAM","QUIZ"].includes(e.eventType)).length],["CANCELLED",events.filter(e=>e.status==="CANCELLED").length]].map(([label,value])=><article key={label}><small>{label}</small><strong>{loading||result.error?"—":value}</strong><span>Selected date range</span></article>)}</div>
    <div className="tc-toolbar"><div className="tc-navigation"><button aria-label="Previous date range" onClick={()=>setSelected(calendarDate(shift(new Date(`${selected}T12:00:00`),view==="Day"?-1:-7)))}>‹</button><input aria-label="Selected date" type="date" required value={selected} onChange={e=>{if(e.target.value)setSelected(e.target.value);}}/><button aria-label="Next date range" onClick={()=>setSelected(calendarDate(shift(new Date(`${selected}T12:00:00`),view==="Day"?1:7)))}>›</button><button onClick={()=>setSelected(calendarDate(new Date()))}>Today</button></div><div className="tc-tabs">{(["Week","Day","List"] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v}</button>)}</div><button onClick={()=>setReload(n=>n+1)}>↻ Refresh</button></div>
    <div className="tc-filters"><input aria-label="Search events" placeholder="Search events or locations…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Filter course" value={course} onChange={e=>setCourse(e.target.value)}><option value="">All courses</option>{courses.map(c=><option key={c.id} value={c.id}>{c.courseName}</option>)}</select><select aria-label="Filter event type" value={kind} onChange={e=>setKind(e.target.value)}><option value="">All event types</option>{types.map(t=><option key={t}>{t}</option>)}</select><select aria-label="Filter status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option>SCHEDULED</option><option>CANCELLED</option></select></div>
    {notice&&<p className="tc-success" role="status">{notice}</p>}{error&&<p className="tc-error" role="alert">{error}</p>}
    <div className="tc-layout"><section className="tc-board" aria-busy={loading}><header><h2>{range.start.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})}{view!=="Day"&&` – ${shift(range.end,-1).toLocaleDateString(undefined,{month:"short",day:"numeric"})}`}</h2><small>Local time</small></header>
      {loading?<p className="tc-empty" role="status">Loading your calendar…</p>:result.error?<div className="tc-empty" role="alert"><p>{result.error}</p><button onClick={()=>setReload(n=>n+1)}>Retry</button></div>:view==="List"?<div className="tc-list">{visible.map(e=><div key={e.id}><small>{new Date(e.startDateTime).toLocaleDateString()}</small>{card(e)}</div>)}{!visible.length&&<p className="tc-empty">No events match these dates and filters.</p>}</div>:<div className={`tc-week ${view==="Day"?"tc-day":""}`}>{days.map(day=><section key={calendarDate(day)} className={calendarDate(day)===selected?"tc-selected":""}><button className="tc-day-heading" onClick={()=>{setSelected(calendarDate(day));setView("Day");}}><small>{day.toLocaleDateString(undefined,{weekday:"short"})}</small><strong>{day.getDate()}</strong></button><div>{visible.filter(e=>occurs(e,day)).map(card)}{!visible.some(e=>occurs(e,day))&&<p className="tc-day-empty">No events</p>}<button className="tc-add" aria-label={`Add event on ${calendarDate(day)}`} onClick={()=>{setSelected(calendarDate(day));setEditing(null);}}>＋ Add event</button></div></section>)}</div>}
    </section><aside className="tc-sidebar"><h2>Your teaching calendar</h2><p>Choose a date to see authorized course activity. Events are synchronized with the Calendar Service.</p><h3>Event colors</h3><div className="tc-legend">{types.map(t=><span className={`tc-event tc-${t.toLowerCase()}`} key={t}>{t}</span>)}</div><h3>Event management</h3><p>Edit and cancel controls appear only when allowed by the backend. Source-managed assessments and attendance stay in their original workspace.</p><button className="tc-primary" onClick={()=>setEditing(null)}>＋ Create Event</button></aside></div>
    {editing!==undefined&&<CalendarEventEditor event={editing} date={selected} courses={courses} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);setReload(n=>n+1);setNotice(editing?"Event updated.":"Event created.");}}/>}
  </section>;
}

