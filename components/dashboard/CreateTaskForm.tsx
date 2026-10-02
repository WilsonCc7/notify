"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { apiError } from "@/components/dashboard/api";

function DueHint() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="#0EA5E9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}


export function CreateTaskForm({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [courseLabel, setCourseLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          dueAt: dueAt || undefined,
          courseLabel: courseLabel.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(await apiError(res, "Could not add that task."));

      setTitle("");
      setDueAt("");
      setDescription("");
      setCourseLabel("");
      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_11rem]">
        <div>
          <label htmlFor="task-title" className="sr-only">
            Task title
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task"
            disabled={saving}
            aria-invalid={error !== null}
            aria-describedby={error ? "task-error" : undefined}
            className="min-h-11 w-full rounded-input border border-line bg-surface px-3 text-base text-ink placeholder:text-muted disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="task-label" className="sr-only">
            Course label
          </label>
          <input
            id="task-label"
            value={courseLabel}
            onChange={(e) => setCourseLabel(e.target.value)}
            placeholder="Course label"
            disabled={saving}
            className="min-h-11 w-full rounded-input border border-line bg-surface px-3 text-base text-ink placeholder:text-muted disabled:opacity-50"
          />
        </div>
        <div className="relative">
          <label htmlFor="task-due" className="sr-only">
            Due date
          </label>
          <DueHint />
          <input
            id="task-due"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            disabled={saving}
            className="min-h-11 w-full rounded-input border border-line bg-surface px-3 pl-10 text-base text-ink disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="task-description" className="sr-only">
          Notes
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes, optional"
          rows={2}
          disabled={saving}
          className="w-full resize-y rounded-input border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {error ? (
          <p id="task-error" role="alert" className="mr-auto text-sm text-rose-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60"
        >
          <Plus size={20} weight="bold" />
          {saving ? "Adding" : "Add task"}
        </button>
      </div>
    </form>
  );
}