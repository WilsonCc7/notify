"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, Circle, EnvelopeSimple, Trash } from "@phosphor-icons/react";
import { AssignmentFile, ClassroomCap } from "@/components/icons/TaskGlyphs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task, TaskSource, TaskStatus } from "@/lib/contract";
import { apiError } from "@/components/dashboard/api";

function SourceGlyph({ source }: { source: TaskSource }) {
  const Glyph = source === "classroom" ? ClassroomCap : AssignmentFile;
  return <Glyph size={16} className="shrink-0 text-muted" />;
}

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

const STATUS_LABEL: Record<TaskStatus, string> = { todo: "To do", doing: "Doing", done: "Done" };

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
  const [confirming, setConfirming] = useState(false);

  const reduced = useReducedMotion();

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

  // Resolves false on failure so callers that own transient UI (the delete
  // dialog) hold it open with the error visible.
  async function run(send: () => Promise<Response>, fallback: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await send();
      if (!res.ok) throw new Error(await apiError(res, fallback));
      await onChange();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback);
      return false;
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

  const remove = async () => {
    const ok = await run(
      () => fetch(`/api/tasks?id=${encodeURIComponent(task.id)}`, { method: "DELETE" }),
      "Could not delete that task.",
    );
    if (ok) setConfirming(false);
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
        <motion.span
          initial={false}
          animate={reduced ? { scale: 1 } : done ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid place-items-center"
        >
          {done ? (
            <CheckCircle size={24} weight="fill" className="text-accent" />
          ) : (
            <Circle size={24} />
          )}
        </motion.span>
      </button>

      <div className="min-w-0">
        <p className={`flex items-center gap-2 text-base ${done ? "text-muted line-through" : "font-medium text-ink"}`}>
          <SourceGlyph source={task.source} />
          <span className="truncate">{task.title}</span>
        </p>
        {task.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{task.description}</p>
        ) : null}
      </div>

      <div className="col-span-2 col-start-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:col-start-auto">
        {task.dueAt ? (
          <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${tone}`}>
            {overdue ? (
              <span className="relative grid size-2 place-items-center">
                <span className="size-2 rounded-full bg-rose-500" />
                {reduced ? null : (
                  <motion.span
                    className="absolute size-2 rounded-full bg-rose-500"
                    initial={{ scale: 1, opacity: 0.55 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </span>
            ) : null}
            {overdue ? "Overdue " : soon ? "Due " : ""}
            {day(task.dueAt)}
          </span>
        ) : null}

        <Select value={task.status} onValueChange={(v) => move(v as TaskStatus)}>
          <SelectTrigger
            disabled={busy}
            aria-label={`Status for ${task.title}`}
            className="min-h-11 w-auto rounded-input! border-line bg-surface px-2 text-sm text-ink disabled:opacity-50 sm:min-h-9"
          >
            <SelectValue>{STATUS_LABEL[task.status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(task.title)}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Search Gmail for ${task.title}`}
                className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-accent sm:size-9"
              >
                <EnvelopeSimple size={20} />
              </a>
            </TooltipTrigger>
            <TooltipContent>Search Gmail</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={confirming} onOpenChange={setConfirming}>
          <DialogTrigger asChild>
            <button
              type="button"
              disabled={busy}
              aria-label={`Delete ${task.title}`}
              className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-rose-600 disabled:opacity-50 sm:size-9"
            >
              <Trash size={20} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this task?</DialogTitle>
              <DialogDescription>
                &quot;{task.title}&quot; is removed for everyone in the group. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {error ? (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <button
                  type="button"
                  className="min-h-11 rounded-input! border border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:bg-zinc-50 sm:min-h-9"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="min-h-11 rounded-input! bg-destructive px-4 text-sm font-medium text-white transition-colors hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-60 sm:min-h-9"
              >
                {busy ? "Deleting" : "Delete"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && !confirming ? (
        <p role="alert" className="col-span-2 col-start-2 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </li>
  );
}
