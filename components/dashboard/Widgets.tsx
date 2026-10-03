// Presentational dashboard widgets. No fetch, no motion, no client hooks:
// pure props in, markup out. Dots use illustration hues (allowed on status
// dots); numbers are always real counts passed from DashboardShell.
import { AssignmentFile, ClassroomCap } from "@/components/icons/TaskGlyphs";
import type { Task } from "@/lib/contract";

const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";

// Date-only tasks are UTC midnight (see parseDue in the route), so format in
// UTC. Local formatting would show Oct 4 for anyone west of Greenwich.
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const SOON_MS = 48 * 3600 * 1000;

function DueChip({ dueAt }: { dueAt: string | null | undefined }) {
  if (!dueAt) {
    return (
      <span className="inline-flex min-h-7 items-center rounded-pill bg-zinc-100 px-3 text-xs font-medium text-muted">
        No due date
      </span>
    );
  }
  const ms = new Date(dueAt).getTime() - Date.now();
  const tone =
    ms < 0
      ? "bg-rose-50 text-rose-700"
      : ms < SOON_MS
        ? "bg-amber-50 text-amber-700"
        : "bg-zinc-100 text-muted";
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-pill px-3 text-xs font-medium ${tone}`}
    >
      {ms < 0 ? `Overdue, due ${day(dueAt)}` : `Due ${day(dueAt)}`}
    </span>
  );
}

export function UpNext({ task }: { task: Task | null }) {
  if (!task) {
    return (
      <section className={CARD} aria-label="Up next">
        <h2 className="text-lg font-semibold text-ink">Up next</h2>
        <p className="text-base leading-relaxed text-muted">
          Nothing on your list. Add one with the form below.
        </p>
      </section>
    );
  }
  const Glyph = task.source === "classroom" ? ClassroomCap : AssignmentFile;
  return (
    <section className={CARD} aria-label="Up next">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Up next</h2>
        <div className="flex min-w-0 items-center gap-2">
          {task.courseLabel ? (
            <span
              title={task.courseLabel}
              className="inline-flex max-w-28 items-center truncate rounded-pill bg-zinc-100 px-2.5 py-1 text-xs font-medium text-muted"
            >
              {task.courseLabel}
            </span>
          ) : null}
          {task.priority === "high" ? (
            <span className="inline-flex shrink-0 items-center rounded-pill bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
              High
            </span>
          ) : null}
          <DueChip dueAt={task.dueAt} />
        </div>
      </div>
      <p className="flex items-center gap-2 text-base text-ink">
        <Glyph size={18} className="shrink-0 text-muted" />
        <span className="truncate font-medium">{task.title}</span>
      </p>
      {task.description ? (
        <p className="truncate text-sm leading-relaxed text-muted">{task.description}</p>
      ) : null}
    </section>
  );
}

export function CountsRow({ todo, due48, done, doneWeek }: { todo: number; due48: number; done: number; doneWeek: number }) {
  const tiles = [
    { label: "To do", value: todo, dot: "bg-sky-500" },
    { label: "Due in 48h", value: due48, dot: "bg-amber-500" },
    { label: "Done", value: done, dot: "bg-emerald-500" },
    { label: "Done this week", value: doneWeek, dot: "bg-emerald-300" },
  ];
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Task counts">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="grid content-start gap-1 rounded-card border border-line bg-surface p-4 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]"
        >
          <span className={`size-2 rounded-full ${t.dot}`} aria-hidden="true" />
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">
            {t.value}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {t.label}
          </span>
        </div>
      ))}
    </section>
  );
}
