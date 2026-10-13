"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { teacherApi, type CommunicationGroup, type CommunicationMessage, type GroupMember, type TeacherCourse } from "../lib/teacherApi";

export default function TeacherCommunication({ courses, currentUserId }: { courses: TeacherCourse[]; currentUserId?: string }) {
  const [groups, setGroups] = useState<CommunicationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunicationGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupCourseId, setGroupCourseId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const detailsToggle = useRef<HTMLButtonElement>(null);
  const requestVersion = useRef(0);
  const activeGroup = useRef("");
  const bottom = useRef<HTMLDivElement>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const createDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (showCreate) createDialog.current?.showModal(); }, [showCreate]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [messages]);
  useEffect(() => () => { requestVersion.current += 1; activeGroup.current = ""; }, []);

  const courseName = useMemo(() => (courseId: string) => courses.find((course) => course.id === courseId)?.courseName || `Course ${courseId.slice(0, 8)}`, [courses]);
  const availableCourses = useMemo(() => courses.filter((course) => !groups.some((group) => group.courseId === course.id)), [courses, groups]);
  const filteredGroups = useMemo(() => {
    const query = groupSearch.trim().toLowerCase();
    return groups.filter((group) => (!activeOnly || group.status === "ACTIVE") && (!query || `${group.name} ${courseName(group.courseId)}`.toLowerCase().includes(query)));
  }, [courseName, groupSearch, groups, activeOnly]);

  async function loadGroups(selectFirst = true) {
    setLoading(true);
    setError("");
    try {
      const nextGroups = await teacherApi.groups();
      setGroups(nextGroups);
      if (selectFirst && nextGroups[0]) await openGroup(nextGroups[0]);
      if (!nextGroups.length || (!selectFirst && !nextGroups.some(group => group.id === activeGroup.current))) {
        requestVersion.current += 1; activeGroup.current = "";
        setSelectedGroup(null); setMembers([]); setMessages([]); setMessage(""); setDetailLoading(false);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load communication groups.");
    } finally {
      setLoading(false);
    }
  }

  async function openGroup(group: CommunicationGroup) {
    const version = ++requestVersion.current;
    activeGroup.current = group.id;
    setMessage(drafts[group.id] || "");
    setMessages([]); setMembers([]);
    setSelectedGroup(group);
    setDetailLoading(true);
    setError("");
    try {
      const [nextMembers, history] = await Promise.all([teacherApi.groupMembers(group.id), teacherApi.messages(group.id)]);
      if (version !== requestVersion.current) return;
      setMembers(nextMembers);
      setMessages((history.content || []).slice().sort((a,b) => (a.sentAt || "").localeCompare(b.sentAt || "")));
    } catch (loadError) {
      if (version !== requestVersion.current) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load this group.");
    } finally {
      if (version === requestVersion.current) setDetailLoading(false);
    }
  }

  // Load the current user's groups after the client session is available.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void loadGroups(); }, []);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    if (saving || !availableCourses.some(course => course.id === groupCourseId) || !groupName.trim()) return;
    setSaving(true); setError("");
    try {
      const created = await teacherApi.createGroup({ courseId: groupCourseId, name: groupName.trim(), description: groupDescription.trim() });
      setGroups((current) => [...current, created]);
      setShowCreate(false); setGroupName(""); setGroupDescription(""); setGroupCourseId("");
      await openGroup(created);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create the communication group.");
    } finally { setSaving(false); }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (saving || detailLoading || !selectedGroup || !message.trim()) return;
    const groupId = selectedGroup.id;
    setSaving(true); setError("");
    try {
      const sent = await teacherApi.sendMessage(groupId, message.trim());
      setDrafts(current => ({ ...current, [groupId]: "" }));
      if (activeGroup.current === groupId) {
        setMessages((current) => current.some(item => item.id === sent.id) ? current : [...current, sent]);
        setMessage("");
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send the message.");
    } finally { setSaving(false); }
  }

  return <section className="teacher-communication tm-workspace"><div className="teacher-communication-header"><div><span className="teacher-kicker">TEACHER PORTAL › AI &amp; COMMUNICATION › MESSAGES</span><h2>Messages &amp; Student Communications</h2><p>Stay connected with your students and course community.</p></div><button type="button" onClick={() => setShowCreate(true)} disabled={!availableCourses.length}>＋ New Chat</button></div>{error && <div role="alert" className="teacher-inline-error">{error}</div>}<div className={`teacher-communication-grid ${detailsOpen ? "" : "tm-details-closed"}`}><aside className="teacher-group-list"><div className="teacher-group-list-heading"><strong>Conversations</strong><button type="button" disabled={loading || saving} onClick={() => void loadGroups(false)}>↻ Refresh</button></div><label className="teacher-chat-search"><span>⌕</span><input value={groupSearch} onChange={(event) => setGroupSearch(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" /></label><div className="tm-filter-tabs"><button aria-pressed={!activeOnly} onClick={()=>setActiveOnly(false)}>All ({groups.length})</button><button aria-pressed={activeOnly} onClick={()=>setActiveOnly(true)}>Active courses</button></div>{loading ? <div className="teacher-state">Loading groups…</div> : filteredGroups.length ? filteredGroups.map((group) => <button type="button" key={group.id} disabled={saving} aria-pressed={selectedGroup?.id === group.id} className={selectedGroup?.id === group.id ? "active" : ""} onClick={() => void openGroup(group)}><span className="teacher-group-avatar">{group.name.charAt(0).toUpperCase()}</span><span><strong>{group.name}</strong><small>{courseName(group.courseId)}</small></span><em>{group.status || "Group"}</em></button>) : <div className="teacher-empty"><strong>{groups.length ? "No matching chats" : "No communication groups"}</strong><p>{groups.length ? "Try another search." : "Create a group for one of your courses to start communicating."}</p></div>}</aside><section className="teacher-chat-panel">{selectedGroup ? <><div className="teacher-chat-heading"><div className="teacher-chat-identity"><span className="teacher-group-avatar large">{selectedGroup.name.charAt(0).toUpperCase()}</span><div><h3>{selectedGroup.name}</h3><p>{members.length} member{members.length === 1 ? "" : "s"} · {courseName(selectedGroup.courseId)}</p></div></div><div className="teacher-chat-actions"><button ref={detailsToggle} type="button" aria-expanded={detailsOpen} aria-controls="tm-conversation-details" onClick={()=>setDetailsOpen(open=>!open)}>{detailsOpen ? "Hide details ›" : "‹ Show details"}</button><button type="button" disabled={saving || detailLoading} onClick={()=>void openGroup(selectedGroup)} aria-label="Refresh conversation">↻ Refresh</button></div></div>{detailLoading ? <div className="teacher-state">Loading conversation…</div> : <><div className="teacher-chat-messages"><div className="tm-conversation-note">Course conversation · Messages are shared with this group’s members.</div>{messages.length ? messages.map((item) => <div key={item.id} className={`tm-message-row ${item.senderId === currentUserId ? "mine" : ""}`}><article className={`teacher-chat-message ${item.senderId === currentUserId ? "mine" : ""}`}><p>{item.deletedForEveryone ? "Message deleted" : item.content}</p></article><small className="tm-message-time"><span className="tm-message-author">{item.senderId === currentUserId ? "You" : `Member ${item.senderId.slice(0,8)}`}</span><span>{item.sentAt ? new Date(item.sentAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Time unavailable"}</span></small></div>) : <div className="teacher-empty"><strong>No messages yet</strong><p>Send the first message to this course group.</p></div>}<div ref={bottom}/></div><form className="teacher-message-form" onSubmit={sendMessage}><textarea aria-label="Message" disabled={saving} required maxLength={5000} rows={2} value={message} onChange={(event) => { setMessage(event.target.value); setDrafts(current=>({...current,[selectedGroup.id]:event.target.value})); }} placeholder="Type a message" /><button className="teacher-send-button" type="submit" disabled={saving || !message.trim()} aria-label="Send message">{saving ? "…" : "➤"}</button></form></>}</> : <div className="teacher-empty teacher-empty-large"><strong>Select a conversation</strong><p>Your course conversations will appear here.</p></div>}</section><aside id="tm-conversation-details" className="tm-details" aria-label="Conversation details" aria-hidden={!detailsOpen} inert={!detailsOpen}><div className="tm-details-inner"><header className="tm-details-heading"><strong>Chat details</strong><button type="button" aria-label="Close conversation details" onClick={()=>{setDetailsOpen(false);detailsToggle.current?.focus();}}>×</button></header>{selectedGroup ? <><div className="tm-profile"><span className="teacher-group-avatar large">{selectedGroup.name.charAt(0).toUpperCase()}</span><h3>{selectedGroup.name}</h3><p>{courseName(selectedGroup.courseId)}</p><span className="tm-pill">{selectedGroup.status || "Course group"}</span></div><h4>CONVERSATION DETAILS</h4><div className="tm-detail-metrics"><div><small>Members</small><strong>{detailLoading ? "…" : members.length}</strong></div><div><small>Loaded messages</small><strong>{detailLoading ? "…" : messages.length}</strong></div></div><p>{selectedGroup.description || "A shared space for course questions, updates, and learning discussions."}</p><h4>GROUP MEMBERS</h4><div className="tm-members">{members.map(member=><div key={member.userId}><span className="tm-member-icon">{(member.role || "M").charAt(0)}</span><span><strong>{member.userId===currentUserId ? "You" : `Member ${member.userId.slice(0,8)}`}</strong><small>{member.role || "Course member"}</small></span></div>)}</div><div className="tm-support-note">Text messaging is available. Attachments, read receipts, and student academic summaries are not provided by this service.</div></> : <div className="teacher-empty">Select a chat to see its details.</div>}</div></aside></div>{showCreate && <dialog ref={createDialog} className="tm-create-dialog" onCancel={event=>{event.preventDefault();if(!saving)setShowCreate(false);}} aria-labelledby="tm-create-title"><form className="teacher-create-card" onSubmit={createGroup}><h3 id="tm-create-title">Create course chat</h3><p>Only assigned courses can be used to create a teacher group.</p>{error && <p role="alert" className="teacher-inline-error">{error}</p>}<label>Course<select required value={groupCourseId} onChange={(event) => setGroupCourseId(event.target.value)}><option value="">Select course</option>{availableCourses.map((course) => <option key={course.id} value={course.id}>{course.courseName}</option>)}</select></label><label>Group name<input required maxLength={150} value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="e.g. Grade 10 Mathematics" /></label><label>Description<textarea rows={3} value={groupDescription} onChange={(event) => setGroupDescription(event.target.value)} /></label><div><button type="button" disabled={saving} className="teacher-cancel-button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Creating…" : "Create group"}</button></div></form></dialog>}</section>;
}
