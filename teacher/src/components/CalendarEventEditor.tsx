"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { teacherApi, type CalendarEvent, type CalendarEventType, type TeacherCourse } from "../lib/teacherApi";

function localInput(value:string) { const date=new Date(value); const pad=(n:number)=>String(n).padStart(2,"0"); return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
export default function CalendarEventEditor({event,date,courses,onClose,onSaved}:{event:CalendarEvent|null;date:string;courses:TeacherCourse[];onClose:()=>void;onSaved:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [visibility,setVisibility]=useState(event?.visibility||"COURSE");
  const [allDay,setAllDay]=useState(event?.allDay||false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
  async function save(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();if(saving)return;setError("");
    const data=new FormData(e.currentTarget);const value=(name:string)=>String(data.get(name)||"").trim();
    const start=new Date(value("start")+(allDay?"T00:00:00":""));
    const end=value("end")?new Date(value("end")+(allDay?"T00:00:00":"")):undefined;
    if(!value("title")||Number.isNaN(start.getTime())||(end&&(Number.isNaN(end.getTime())||end<=start))){setError("Enter a title and an end time after the start time.");return;}
    if(visibility==="COURSE"&&!courses.some(c=>c.id===value("course"))){setError("Select one of your assigned courses.");return;}
    if(event&&!event.canEdit){setError("You cannot edit this event.");return;}
    const draft={title:value("title"),description:value("description"),eventType:value("type") as CalendarEventType,startDateTime:start.toISOString(),endDateTime:end?.toISOString(),allDay,visibility,courseId:visibility==="COURSE"?value("course"):undefined,targetRole:visibility==="ROLE"?event?.targetRole:undefined,location:value("location")};
    setSaving(true);
    try{if(event)await teacherApi.updateCalendarEvent(event.id,draft);else await teacherApi.createCalendarEvent(draft);onSaved();}
    catch(caught){setError(caught instanceof Error?caught.message:"Could not save event.");}
    finally{setSaving(false);}
  }
  const tomorrow=new Date(`${date}T12:00:00`);tomorrow.setDate(tomorrow.getDate()+1);
  return <dialog className="tc-modal" ref={dialog} aria-labelledby="tc-editor-title" onCancel={e=>{e.preventDefault();if(!saving)onClose();}}><form onSubmit={save}>
    <header><h2 id="tc-editor-title">{event?"Edit calendar event":"Schedule an event"}</h2><button type="button" disabled={saving} onClick={onClose} aria-label="Close event editor">×</button></header>
    <fieldset disabled={saving}>
      <label>Title<input name="title" autoFocus required maxLength={200} defaultValue={event?.title}/></label>
      <label>Description<textarea name="description" defaultValue={event?.description}/></label>
      <div className="tc-form-grid"><label>Event type<select name="type" defaultValue={event?.eventType||"MEETING"}>{["CLASS","MEETING","EXAM","QUIZ","ASSIGNMENT","ATTENDANCE","HOLIDAY","ADMIN","CUSTOM"].map(t=><option key={t}>{t}</option>)}</select></label>
      <label>Visibility<select value={visibility} onChange={e=>setVisibility(e.target.value as typeof visibility)}><option>COURSE</option><option>PRIVATE</option>{event&&!["COURSE","PRIVATE"].includes(event.visibility)&&<option>{event.visibility}</option>}</select></label></div>
      {visibility==="COURSE"&&<label>Course<select name="course" required defaultValue={event?.courseId||""}><option value="">Select assigned course</option>{courses.map(c=><option key={c.id} value={c.id}>{c.courseName}</option>)}</select></label>}
      <label className="tc-checkbox"><input type="checkbox" checked={allDay} onChange={e=>setAllDay(e.target.checked)}/>All-day event</label>
      <div className="tc-form-grid"><label>Start<input key={`start-${allDay}`} type={allDay?"date":"datetime-local"} name="start" required defaultValue={event?(allDay?localInput(event.startDateTime).slice(0,10):localInput(event.startDateTime)):allDay?date:`${date}T09:00`}/></label>
      <label>{allDay?"End date (exclusive)":"End"}<input key={`end-${allDay}`} type={allDay?"date":"datetime-local"} name="end" required={allDay} defaultValue={event?.endDateTime?(allDay?localInput(event.endDateTime).slice(0,10):localInput(event.endDateTime)):allDay?localInput(tomorrow.toISOString()).slice(0,10):`${date}T10:00`}/></label></div>
      <label>Location<input name="location" defaultValue={event?.location}/></label>
    </fieldset>
    {error&&<p role="alert" className="tc-error">{error}</p>}
    <footer><button type="button" disabled={saving} onClick={onClose}>Close</button><button className="tc-primary" disabled={saving}>{saving?"Saving…":event?"Save Changes":"Create Event"}</button></footer>
    <p>Changes are validated and authorized by the backend.</p>
  </form></dialog>;
}
