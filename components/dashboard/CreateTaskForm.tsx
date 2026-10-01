"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { apiError } from "@/components/dashboard/api";

export function CreateTaskForm({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
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
        }),
      });
      if (!res.ok) throw new Error(await apiError(res, "Could not add that task."));

      setTitle("");
      setDueAt("");
      setDescription("");
      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
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
          <label htmlFor="task-due" className="sr-only">
            Due date
          </label>
          <input
            id="task-due"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            disabled={saving}
            className="min-h-11 w-full rounded-input border border-line bg-surface px-3 text-base text-ink disabled:opacity-50"
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