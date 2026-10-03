// Month view over tasks.dueAt only. No Google Calendar calls, no client hooks,
// no motion: the server reads the session, the DB, and ?m=YYYY-MM, then renders.
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { Task, TaskPriority, TaskSource, TaskStatus } from "@/lib/contract";

export const dynamic = "force-dynamic";

const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";
const PILL =
  "inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-zinc-50 sm:min-h-10";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_TITLES = 3;
const SOON_MS = 48 * 3600 * 1000;

type Row = {
  id: string;
  source: string;
  courseId: string | null;
  classroomCourseworkId: string | null;
  title: string;
  description: string | null;
  dueAt: Date | null;
  priority: string;
  task_state: { status: string; completedAt: Date | null }[];
  _count: { posts: number };
};

// Same mapper as app/api/tasks/route.ts, copied so this page does not import a route handler.
const toTask = (r: Row): Task => ({
  id: r.id,
  source: r.source as TaskSource,
  courseId: r.courseId,
  classroomCourseworkId: r.classroomCourseworkId ?? undefined,
  title: r.title,
  description: r.description ?? undefined,
  dueAt: r.dueAt ? r.dueAt.toISOString() : null,
  status: (r.task_state[0]?.status as TaskStatus | undefined) ?? "todo",
  priority: (r.priority as TaskPriority | undefined) ?? "normal",
  completedAt: r.task_state[0]?.completedAt ? r.task_state[0].completedAt.toISOString() : null,
  replyCount: r._count.posts,
});

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Due dates are UTC midnight (see parseDue), so the grid is UTC too: a task
// stored as Oct 31 renders on the Oct 31 cell the dashboard also prints.
function parseMonth(raw: string | string[] | undefined): { year: number; month: number } {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && MONTH_RE.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return { year, month: month - 1 };
  }
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
}

// Illustration hues only: rose overdue, amber due soon, sky further out.
function dotTone(dueAt: number, now: number): string {
  const ms = dueAt - now;
  if (ms < 0) return "bg-rose-500";
  return ms < SOON_MS ? "bg-amber-500" : "bg-sky-500";
}

function DayCell({
  iso,
  day,
  tasks,
  today,
  now,
}: {
  iso: string;
  day: number;
  tasks: Task[];
  today: boolean;
  now: number;
}) {
  const shown = tasks.slice(0, MAX_TITLES);
  const extra = tasks.length - shown.length;

  return (
    <div
      aria-label={`${iso}, ${tasks.length} due`}
      className="grid min-h-24 content-start gap-1 rounded-card border border-line bg-surface p-3 shadow-[0_1px_2px_rgb(24_24_27/0.04)] sm:min-h-32"
    >
      <span
        className={
          today
            ? "inline-flex size-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
            : "text-xs font-medium text-muted"
        }
      >
        {day}
      </span>
      {shown.map((task) => (
        <span key={task.id} className="flex items-center gap-1.5">
          {task.status === "done" || !task.dueAt ? null : (
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${dotTone(new Date(task.dueAt).getTime(), now)}`}
            />
          )}
          <span
            className={`truncate text-xs ${task.status === "done" ? "text-muted line-through" : "text-ink"}`}
          >
            {task.title}
          </span>
        </span>
      ))}
      {extra > 0 ? (
        <span className="text-xs font-medium text-muted">{`+${extra} more`}</span>
      ) : null}
    </div>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string | string[] }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { year, month } = parseMonth((await searchParams).m);

  const rows = await prisma.tasks.findMany({
    where: { dueAt: { gte: new Date(Date.UTC(year, month, 1)), lt: new Date(Date.UTC(year, month + 1, 1)) } },
    include: { task_state: { where: { userId: user.id } }, _count: { select: { posts: true } } },
    orderBy: { dueAt: "asc" },
  });

  const byDay: Record<string, Task[]> = {};
  for (const row of rows) {
    if (!row.dueAt) continue;
    const iso = row.dueAt.toISOString().slice(0, 10);
    byDay[iso] = [...(byDay[iso] ?? []), toTask(row)];
  }

  const prev = new Date(Date.UTC(year, month - 1, 1));
  const next = new Date(Date.UTC(year, month + 1, 1));
  const prevHref = `/calendar?m=${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;
  const nextHref = `/calendar?m=${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;

  const lead = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const dueCount = Object.keys(byDay).length;

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            notify
          </Link>
          <Link href="/" className={PILL}>
            Back to dashboard
          </Link>
        </header>

        <section className={CARD}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid gap-1">
              <h1 className="text-lg font-semibold text-ink">{label}</h1>
              <p className="text-sm text-muted">
                {dueCount === 0
                  ? "No due dates this month"
                  : `Due on ${dueCount} day${dueCount === 1 ? "" : "s"}`}
              </p>
            </div>
            <nav className="flex items-center gap-2" aria-label="Month navigation">
              <Link href={prevHref} className={PILL}>
                Previous
              </Link>
              <Link href={nextHref} className={PILL}>
                Next
              </Link>
            </nav>
          </div>
        </section>

        {dueCount === 0 ? (
          <section className={CARD}>
            <h2 className="text-lg font-semibold text-ink">Nothing due in {label}</h2>
            <p className="text-base leading-relaxed text-muted">
              Next step: add a due date from the dashboard form, or step through the months with
              the arrows above to see what is already on your list.
            </p>
          </section>
        ) : (
          <section className="grid gap-2 sm:grid-cols-7" aria-label={`Due dates for ${label}`}>
            {WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="hidden px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted sm:block"
              >
                {weekday}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`pad-${i}`} className="hidden sm:block" aria-hidden="true" />;
              }
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <DayCell
                  key={iso}
                  iso={iso}
                  day={day}
                  tasks={byDay[iso] ?? []}
                  today={iso === today}
                  now={now}
                />
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}