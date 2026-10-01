"use client";

import { useState } from "react";
import { CheckCircle, Circle, EnvelopeSimple, Trash } from "@phosphor-icons/react";
import type { Task, TaskStatus } from "@/lib/contract";
import { apiError } from "@/components/dashboard/api";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

// Due dates are date-only (UTC midnight, see parseDue in the route), so read the chip
// back in UTC. Formatting in local time would show Oct 4 for anyone west of Greenwich.
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function TaskRow({
  task,
  onChange,
}: {
  task: Task;
  onChange: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = task.status === "done";
  const due = task.dueAt ? new Date(task.dueAt) : null;
  const overdue = due !== null && !done && due.getTime() < Date.now();
  const soon = due !== null && !done && !overdue && due.getTime() - Date.now() < 48 * 3600 * 1000;
  const tone = overdue
    ? "bg-rose-50 text-rose-700"
    : soon
      ? "bg-amber-50 text-amber-700"
      : done
        ? "bg-zinc-100 text-zinc-600"
        : "bg-zinc-100 text-muted";

  async function run(send: () => Promise<Response>, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await send();
      if (!res.ok) throw new Error(await apiError(res, fallback));
      await onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setBusy(false);
    }
  }

  const move = (status: TaskStatus) =>
    run(
      () =>
        fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: task.id, status }),
        }),
      "Could not update that task.",
    );

  const remove = () => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    run(
      () => fetch(`/api/tasks?id=${encodeURIComponent(task.id)}`, { method: "DELETE" }),
      "Could not delete that task.",
    );
  };

  return (
    <li className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3">
      <button
        type="button"
        onClick={() => move(done ? "todo" : "done")}
        disabled={busy}
        aria-pressed={done}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-accent disabled:opacity-50 sm:size-10"
      >
        {done ? (
          <CheckCircle size={24} weight="fill" className="text-accent" />
        ) : (
          <Circle size={24} />
        )}
      </button>

      <div className="min-w-0">
        <p className={done ? "truncate text-base text-muted line-through" : "truncate text-base font-medium text-ink"}>
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{task.description}</p>
        ) : null}
      </div>

      <div className="col-span-2 col-start-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:col-start-auto">
        {task.dueAt ? (
          <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${tone}`}>
            {overdue ? "Overdue " : soon ? "Due " : ""}
            {day(task.dueAt)}
          </span>
        ) : null}

        <label className="sr-only" htmlFor={`status-${task.id}`}>
          Status for {task.title}
        </label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          disabled={busy}
          onChange={(e) => move(e.target.value as TaskStatus)}
          className="min-h-11 rounded-input border border-line bg-surface px-2 text-sm text-ink disabled:opacity-50 sm:min-h-9"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "todo" ? "To do" : s === "doing" ? "Doing" : "Done"}
            </option>
          ))}
        </select>

        <a
          href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(task.title)}`}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Search Gmail for ${task.title}`}
          title="Search Gmail"
          className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-accent sm:size-9"
        >
          <EnvelopeSimple size={20} />
        </a>

        <button
          type="button"
          onClick={remove}
          disabled={busy}
          aria-label={`Delete ${task.title}`}
          className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-rose-600 disabled:opacity-50 sm:size-9"
        >
          <Trash size={20} />
        </button>
      </div>

      {error ? (
        <p role="alert" className="col-span-2 col-start-2 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </li>
  );
}
