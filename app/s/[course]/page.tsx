// Kanban board for one manual course label. The path segment is a URL-encoded label
// typed by the user, or the literal "Unfiled" for the null bucket. Server reads the
// session and the DB, the client leaf only moves cards.
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { Task, TaskPriority, TaskSource, TaskStatus } from "@/lib/contract";
import { Board } from "./board";

export const dynamic = "force-dynamic";

const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";
const PILL =
  "inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-zinc-50 sm:min-h-10";

const UNFILED = "Unfiled";
const MAX_LABEL = 80;

type Row = {
  id: string;
  source: string;
  courseId: string | null;
  classroomCourseworkId: string | null;
  courseLabel: string | null;
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
  courseLabel: r.courseLabel ?? null,
  classroomCourseworkId: r.classroomCourseworkId ?? undefined,
  title: r.title,
  description: r.description ?? undefined,
  dueAt: r.dueAt ? r.dueAt.toISOString() : null,
  status: (r.task_state[0]?.status as TaskStatus | undefined) ?? "todo",
  priority: (r.priority as TaskPriority | undefined) ?? "normal",
  completedAt: r.task_state[0]?.completedAt ? r.task_state[0].completedAt.toISOString() : null,
  replyCount: r._count.posts,
});

export default async function BoardPage({ params }: { params: Promise<{ course: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Next may hand over the segment already decoded. Decode defensively: a label may
  // legitimately contain a "%", and a bad escape must not turn the page into a 500.
  const raw = (await params).course ?? "";
  let label: string;
  try {
    label = decodeURIComponent(raw).trim();
  } catch {
    label = raw.trim();
  }

  // Empty or absurd input is a missing board, not a crash: render the empty state.
  const valid = label.length > 0 && label.length <= MAX_LABEL;
  const unfiled = label === UNFILED;

  const rows = valid
    ? await prisma.tasks.findMany({
      where: unfiled ? { courseLabel: null } : { courseLabel: label },
      include: { task_state: { where: { userId: user.id } }, _count: { select: { posts: true } } },
      orderBy: { dueAt: { sort: "asc", nulls: "last" } },
    })
    : [];

  const tasks = rows.map(toTask);
  const open = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            notify
          </Link>
          <Link href="/s" className={PILL}>
            All boards
          </Link>
        </header>

        <section className={CARD}>
          <h1 className="text-lg font-semibold text-ink">{valid ? label : "No board"}</h1>
          <p className="text-base leading-relaxed text-muted">
            {valid
              ? tasks.length === 0
                ? unfiled
                  ? "No task is unfiled right now."
                  : `No task carries the label ${label} yet.`
                : `${tasks.length} task${tasks.length === 1 ? "" : "s"}, ${open} still open. Move a card with the menu on it.`
              : "That board address is empty or too long to be a label."}
          </p>
        </section>

        {valid && tasks.length === 0 ? (
          <section className={CARD}>
            <h2 className="text-lg font-semibold text-ink">Nothing on this board</h2>
            <p className="text-base leading-relaxed text-muted">
              Next step: create a task on the dashboard.{" "}
              {unfiled
                ? "Leave the course label empty and it shows up here."
                : `Type ${label} in the course label field and it shows up here.`}{" "}
              Cards land in todo, then you move them from there.
            </p>
            <div>
              <Link href="/" className={PILL}>
                Add a task
              </Link>
            </div>
          </section>
        ) : valid ? (
          <Board tasks={tasks} />
        ) : (
          <section className={CARD}>
            <h2 className="text-lg font-semibold text-ink">Pick a board instead</h2>
            <p className="text-base leading-relaxed text-muted">
              Boards are listed by the label each task carries. Open one from the board index.
            </p>
            <div>
              <Link href="/s" className={PILL}>
                All boards
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}