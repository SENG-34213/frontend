import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Users,
  Megaphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { UserAvatar } from "../components/UserAvatar";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import {
  createAdminAnnouncement,
  getAdminAnnouncements,
  publishAdminAnnouncement,
  updateAdminAnnouncement,
  deleteAdminAnnouncement,
  type AnnouncementAudience,
  type AnnouncementPriority,
  type BackendAnnouncement,
} from "../api/notificationApi";
import { formatNotificationTime } from "../../../../shared/notifications/notificationFormat";

export const CommunicationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"announcements" | "channels">("announcements");
  const [announcements, setAnnouncements] = useState<BackendAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAudience, setNewAudience] = useState<AnnouncementAudience>("ALL");
  const [newPriority, setNewPriority] = useState<AnnouncementPriority>("NORMAL");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<BackendAnnouncement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<BackendAnnouncement | null>(
    null,
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAdminAnnouncements();
      setAnnouncements(result.content);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load announcements.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Loading from the API is an external synchronization and intentionally updates local state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAnnouncements();
  }, []);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isPublishing) return;

    setIsPublishing(true);
    setError(null);
    try {
      const payload = {
        title: newTitle.trim(),
        content: newContent.trim(),
        audience: newAudience,
        priority: newPriority,
      };
      if (editingAnnouncement) {
        const updated = await updateAdminAnnouncement(editingAnnouncement.id, payload);
        setAnnouncements((current) =>
          current.map((announcement) => (announcement.id === updated.id ? updated : announcement)),
        );
      } else {
        const created = await createAdminAnnouncement(payload);
        const published = await publishAdminAnnouncement(created.id);
        setAnnouncements((current) => [published, ...current]);
      }
      setNewTitle("");
      setNewContent("");
      setNewAudience("ALL");
      setNewPriority("NORMAL");
      setEditingAnnouncement(null);
      setIsComposerOpen(false);
    } catch (publishError) {
      setError(
        publishError instanceof Error ? publishError.message : "Unable to publish announcement.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const openEditAnnouncement = (announcement: BackendAnnouncement) => {
    setEditingAnnouncement(announcement);
    setNewTitle(announcement.title);
    setNewContent(announcement.content);
    setNewAudience(announcement.audience);
    setNewPriority(announcement.priority);
    setIsComposerOpen(true);
  };

  const handleDeleteAnnouncement = async (announcement: BackendAnnouncement) => {
    setError(null);
    try {
      await deleteAdminAnnouncement(announcement.id);
      setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
      setDeletingAnnouncement(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete announcement.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication & Announcements"
        description="Broadcast platform announcements, manage course discussion channels, and oversee school communications."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Communication" },
        ]}
        actions={
          <button
            onClick={() => {
              setEditingAnnouncement(null);
              setIsComposerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Announcement</span>
          </button>
        }
      />

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{error}</span>
          <button onClick={() => void loadAnnouncements()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">Loading announcements…</div>
        )}
        {!isLoading && !announcements.length && !error && (
          <div className="p-8 text-center text-sm text-slate-500">No announcements yet.</div>
        )}
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-1">
                  Target: {ann.audience}
                </span>
                <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {ann.priority}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h3>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {formatNotificationTime(ann.publishedAt || ann.createdAt)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {ann.content}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Created by {ann.createdBy || "Administrator"}</span>
              <div className="flex items-center gap-3">
                <span className="tabular-nums">{ann.status}</span>
                <button
                  type="button"
                  onClick={() => openEditAnnouncement(ann)}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingAnnouncement(ann)}
                  className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {editingAnnouncement ? "Edit Announcement" : "Broadcast Platform Announcement"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatches platform notification and banner alert to student & teacher dashboards.
            </p>

            <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tuition center extended hours for finals week"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Target Audience
                </label>
                <select
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value as AnnouncementAudience)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Users</option>
                  <option value="STUDENT">Students</option>
                  <option value="TEACHER">Teaching Teacher</option>
                  <option value="ADMIN">Administrators</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as AnnouncementPriority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Announcement Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Compose notice body..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setIsComposerOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isPublishing
                    ? editingAnnouncement
                      ? "Saving…"
                      : "Publishing…"
                    : editingAnnouncement
                      ? "Save Changes"
                      : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmationDialog
        isOpen={Boolean(deletingAnnouncement)}
        title="Delete announcement?"
        description={
          deletingAnnouncement
            ? `“${deletingAnnouncement.title}” will be permanently removed from the announcement feed.`
            : "This announcement will be permanently removed from the announcement feed."
        }
        consequences={[
          "Recipients will no longer see this announcement.",
          "This action cannot be undone.",
        ]}
        confirmText="Delete announcement"
        cancelText="Keep announcement"
        variant="danger"
        onCancel={() => setDeletingAnnouncement(null)}
        onConfirm={() => {
          if (deletingAnnouncement) void handleDeleteAnnouncement(deletingAnnouncement);
        }}
      />
    </div>
  );
};
