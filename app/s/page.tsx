// One board per manual course label. No courses table, no Classroom yet: a label is
// whatever text the user typed on the task form, and tasks without one land in Unfiled.
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";
const PILL =
  "inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-zinc-50 sm:min-h-10";

// Illustration palette, dots only (never a card fill, never text). Index keeps a
// label on the same hue between renders because the list is sorted.
const HUES = ["bg-amber-500", "bg-sky-500", "bg-emerald-500", "bg-rose-500"];

export default async function SubjectsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const groups = await prisma.tasks.groupBy({
    by: ["courseLabel"],
    _count: { _all: true },
  });

  const labels = groups
    .filter((g): g is { courseLabel: string; _count: { _all: number } } => g.courseLabel !== null)
    .sort((a, b) => a.courseLabel.localeCompare(b.courseLabel));
  const unfiled = groups.find((g) => g.courseLabel === null)?._count._all ?? 0;

  // Unfiled joins the same list so one card renders both kinds of board.
  const boards = [
    ...labels.map((g, i) => ({
      name: g.courseLabel,
      href: `/s/${encodeURIComponent(g.courseLabel)}`,
      count: g._count._all,
      hue: HUES[i % HUES.length],
    })),
    ...(unfiled > 0
      ? [{ name: "Unfiled", href: "/s/Unfiled", count: unfiled, hue: HUES[labels.length % HUES.length] }]
      : []),
  ];

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
          <h1 className="text-lg font-semibold text-ink">Boards</h1>
          <p className="text-base leading-relaxed text-muted">
            One board per course label, split into todo, doing, and done. Open a label to move
            tasks between the three columns.
          </p>
        </section>

        {boards.length === 0 ? (
          <section className={CARD}>
            <h2 className="text-lg font-semibold text-ink">No boards yet</h2>
            <p className="text-base leading-relaxed text-muted">
              Next step: add a task on the dashboard and type a course label in the form. Every
              task with a label gets a board, and tasks without one collect under Unfiled.
            </p>
            <div>
              <Link href="/" className={PILL}>
                Add a task
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Course boards">
            {boards.map((board) => (
              <Link
                key={board.name}
                href={board.href}
                className={`${CARD} transition-transform hover:-translate-y-0.5 active:scale-[0.98]`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${board.hue}`} />
                    <span className="truncate font-semibold text-ink">{board.name}</span>
                  </span>
                  <ArrowRight size={20} className="shrink-0 text-muted" aria-hidden />
                </span>
                <span className="text-sm text-muted">
                  {`${board.count} task${board.count === 1 ? "" : "s"}`}
                </span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
