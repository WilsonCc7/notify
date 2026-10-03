"use client";

import { useState } from "react";
import { CaretDown, Flag, Plus } from "@phosphor-icons/react";
import { apiError } from "@/components/dashboard/api";

// Single row, everything else behind "More options": the fast path is title + Enter.
// Course label and notes are rare enough that a collapsed row beats a wall of inputs.
export function QuickAdd({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [courseLabel, setCourseLabel] = useState("");
  const [description, setDescription] = useState("");
  const [high, setHigh] = useState(false);
  const [more, setMore] = useState(false);
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
          dueAt: dueAt || undefined,
          priority: high ? "high" : "normal",
          courseLabel: courseLabel.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(await apiError(res, "Could not add that task."));

      setTitle("");
      setDueAt("");
      setCourseLabel("");
      setDescription("");
      setHigh(false);
      setMore(false);
      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="quickadd" onSubmit={submit} noValidate className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="quickadd-title" className="sr-only">
          Task title
        </label>
        <input
          id="quickadd-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task, press Enter"
          disabled={saving}
          aria-invalid={error !== null}
          aria-describedby={error ? "quickadd-error" : undefined}
          className="min-h-11 w-full flex-1 rounded-input border border-line bg-surface px-3 text-base text-ink placeholder:text-muted disabled:opacity-50 sm:w-auto sm:min-w-48"
        />

        <label htmlFor="quickadd-due" className="sr-only">
          Due date
        </label>
        <input
          id="quickadd-due"
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          disabled={saving}
          className="min-h-11 w-36 rounded-input border border-line bg-surface px-3 text-base text-ink disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() => setHigh((v) => !v)}
          disabled={saving}
          aria-pressed={high}
          aria-label="High priority"
          title="High priority"
          className={`grid size-11 shrink-0 place-items-center rounded-pill border border-line transition-colors disabled:opacity-50 sm:size-10 ${
            high ? "border-rose-200 bg-rose-50 text-rose-600" : "text-muted hover:bg-zinc-50"
          }`}
        >
          <Flag size={20} weight={high ? "fill" : "regular"} />
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60 sm:min-h-10"
        >
          <Plus size={20} weight="bold" />
          {saving ? "Adding" : "Add"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          aria-controls="quickadd-more"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          More options
          <CaretDown size={16} weight="bold" className={more ? "rotate-180" : undefined} />
        </button>

        {error ? (
          <p id="quickadd-error" role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        ) : null}
      </div>

      {more ? (
        <div id="quickadd-more" className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quickadd-course" className="sr-only">
              Course label
            </label>
            <input
              id="quickadd-course"
              value={courseLabel}
              onChange={(e) => setCourseLabel(e.target.value)}
              placeholder="Course label"
              disabled={saving}
              className="min-h-11 w-full rounded-input border border-line bg-surface px-3 text-base text-ink placeholder:text-muted disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="quickadd-notes" className="sr-only">
              Notes
            </label>
            <textarea
              id="quickadd-notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, optional"
              rows={2}
              disabled={saving}
              className="w-full resize-y rounded-input border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted disabled:opacity-50"
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}