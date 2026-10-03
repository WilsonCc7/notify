"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { apiError } from "@/components/dashboard/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskStatus } from "@/lib/contract";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

// Illustration palette as small status dots only, never text or card fills.
const COLUMNS: { status: TaskStatus; name: string; dot: string }[] = [
  { status: "todo", name: "Todo", dot: "bg-zinc-400" },
  { status: "doing", name: "Doing", dot: "bg-sky-500" },
  { status: "done", name: "Done", dot: "bg-emerald-500" },
];

const SOON_MS = 48 * 3600 * 1000;

function BoardCard({
  task,
  index,
  enter,
  busy,
  onMove,
}: {
  task: Task;
  index: number;
  enter: boolean;
  busy: boolean;
  onMove: (id: string, status: TaskStatus) => void;
}) {
  const reduced = useReducedMotion();

  const done = task.status === "done";
  const due = task.dueAt ? new Date(task.dueAt) : null;
  const overdue = due !== null && !done && due.getTime() < Date.now();
  const soon = due !== null && !done && !overdue && due.getTime() - Date.now() < SOON_MS;
  const tone = overdue
    ? "bg-rose-50 text-rose-700"
    : soon
      ? "bg-amber-50 text-amber-700"
      : done
        ? "bg-zinc-100 text-zinc-600"
        : "bg-zinc-100 text-muted";

  return (
    <motion.li
      // Entry fade only on the first paint. A refresh after a move must not replay it.
      initial={enter ? (reduced ? { opacity: 1 } : { opacity: 0, y: 8 }) : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.18, delay: reduced ? 0 : index * 0.03 }}
      className="grid gap-2 rounded-input border border-line bg-surface p-3 shadow-[0_1px_2px_rgb(24_24_27/0.04)]"
    >
      <Link
        href={`/t/${task.id}`}
        className={`text-sm hover:underline hover:underline-offset-2 ${done ? "text-muted line-through" : "font-medium text-ink"}`}
      >
        {task.title}
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {task.dueAt ? (
          <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${tone}`}>
            {overdue ? "Overdue " : soon ? "Due " : ""}
            {/* Date-only tasks are UTC midnight (parseDue), so read the chip back in UTC. */}
            {new Date(task.dueAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </span>
        ) : null}

        <span id={`move-label-${task.id}`} className="sr-only">
          Status for {task.title}
        </span>
        <Select
          value={task.status}
          disabled={busy}
          onValueChange={(next) => onMove(task.id, next as TaskStatus)}
        >
          <SelectTrigger
            aria-labelledby={`move-label-${task.id}`}
            className="ml-auto h-auto min-h-11 w-auto justify-between rounded-input! border-line bg-surface px-2 text-ink sm:min-h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "todo" ? "To do" : s === "doing" ? "Doing" : "Done"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.li>
  );
}

export function Board({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // First paint animates in; every later refresh (after a move) renders cards in place.
  const entered = useRef(false);
  const enter = !entered.current;
  useEffect(() => {
    entered.current = true;
  }, []);

  const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
  for (const task of tasks) grouped[task.status].push(task);

  async function move(id: string, status: TaskStatus) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        setError(await apiError(res, "Could not move that task."));
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Try that move again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6">
      {error ? (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const cards = grouped[column.status];
          return (
            <section
              key={column.status}
              aria-label={`${column.name}, ${cards.length} task${cards.length === 1 ? "" : "s"}`}
              className="grid content-start gap-3"
            >
              <header className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${column.dot}`} />
                  {column.name}
                </h2>
                <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                  {cards.length}
                </span>
              </header>

              {cards.length === 0 ? (
                <p className="rounded-input border border-line bg-surface p-3 text-sm text-muted">
                  Nothing here yet.
                </p>
              ) : (
                <ul className="grid content-start gap-3">
                  {cards.map((task, i) => (
                    <BoardCard
                      key={task.id}
                      task={task}
                      index={i}
                      enter={enter}
                      busy={busy === task.id}
                      onMove={move}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        Cards open the task thread when you click the title, and status changes save right away.
      </p>
    </div>
  );
}
