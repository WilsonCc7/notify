// One task: header, thread, composer. Server reads the session and the DB, the client
// leaf only posts, replies and deletes, then calls router.refresh() so this page re-reads.
// No motion here: the board page (app/s/[course]) is server too and stays still.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { THREAD_INCLUDE } from "@/lib/thread";
import { AssignmentFile, ClassroomCap } from "@/components/icons/TaskGlyphs";
import { DeleteButton, PostComposer, ReplyComposer } from "./thread";

export const dynamic = "force-dynamic";

const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";
const PILL =
  "inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-zinc-50 sm:min-h-10";

// Same rules as components/dashboard/TaskRow.tsx, copied so this page pulls in no client
// code for two lines of date math: due dates are UTC midnight, so read them back in UTC.
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

// Thread stamps are relative because "2m ago" beats a date on a note posted a minute ago.
// Past a week a date is the honest answer, and it is read in UTC like everything else here.
function ago(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default async function TaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const taskId = (await params).taskId ?? "";
  // A junk id or a task that no longer exists is a missing task, not a crash: the id column
  // is text, so a bad lookup comes back empty and notFound() answers 404.
  const [row, posts] = await Promise.all([
    prisma.tasks.findUnique({
      where: { id: taskId },
      include: { task_state: { where: { userId: user.id } } },
    }),
    prisma.posts.findMany({
      where: { taskId },
      include: THREAD_INCLUDE,
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!row) notFound();
  const Glyph = row.source === "classroom" ? ClassroomCap : AssignmentFile;
  const due = row.dueAt;
  const overdue = due !== null && due.getTime() < Date.now();
  const soon = due !== null && !overdue && due.getTime() - Date.now() < 48 * 3600 * 1000;
  const tone = overdue
    ? "bg-rose-50 text-rose-700"
    : soon
      ? "bg-amber-50 text-amber-700"
      : "bg-zinc-100 text-muted";

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto grid w-full max-w-3xl content-start gap-6 px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            notify
          </Link>
          <Link href="/" className={PILL}>
            Back to all tasks
          </Link>
        </header>

        <section className={CARD}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="flex min-w-0 items-start gap-2 text-xl font-semibold tracking-tight text-ink">
              <Glyph size={22} className="mt-0.5 shrink-0 text-muted" />
              <span className="min-w-0 break-words">{row.title}</span>
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              {due ? (
                <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${tone}`}>
                  {overdue ? "Overdue " : soon ? "Due " : ""}
                  {day(due.toISOString())}
                </span>
              ) : null}
              <a
                href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(row.title)}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Search Gmail for ${row.title}`}
                title="Search Gmail"
                className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-accent sm:size-9"
              >
                <EnvelopeSimple size={20} />
              </a>
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {row.courseLabel ?? (row.courseId ? "Classroom" : "Unfiled")} ·{" "}
            {(row.task_state[0]?.status ?? "todo") as string}
          </p>

          {row.description ? (
            <p className="text-base leading-relaxed text-muted">{row.description}</p>
          ) : null}
        </section>

        <section className={`${CARD} gap-5`}>
          <h2 className="text-lg font-semibold text-ink">Thread</h2>

          {posts.length === 0 ? (
            <p className="text-base leading-relaxed text-muted">
              Nothing here yet. Post the first note with the class handout, the room number,
              or a link everyone needs. Photos land on this thread once storage is set up,
              so for now a post is text plus a link.
            </p>
          ) : (
            <ol className="grid gap-4">
              {posts.map((post) => (
                <li key={post.id} className="grid gap-3 rounded-input border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <span className="font-medium text-ink">
                        {post.authorId === user.id ? "You" : post.author.name}
                      </span>
                      <span className="text-muted">{ago(post.createdAt.toISOString())}</span>
                    </p>
                    {post.authorId === user.id ? (
                      <DeleteButton url={`/api/posts/${post.id}`} label="Delete this post." />
                    ) : null}
                  </div>

                  <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">
                    {post.bodyText}
                  </p>

                  {post.linkUrl ? (
                    <a
                      href={post.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 truncate text-sm text-accent underline underline-offset-2"
                    >
                      {post.linkUrl}
                    </a>
                  ) : null}

                  {post.replies.length > 0 ? (
                    <ul className="grid gap-3 border-l-2 border-line pl-4">
                      {post.replies.map((reply) => (
                        <li key={reply.id} className="grid gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                              <span className="font-medium text-ink">
                                {reply.authorId === user.id ? "You" : reply.author.name}
                              </span>
                              <span className="text-muted">{ago(reply.createdAt.toISOString())}</span>
                            </p>
                            {reply.authorId === user.id ? (
                              <DeleteButton
                                url={`/api/posts/${post.id}/replies?id=${encodeURIComponent(reply.id)}`}
                                label="Delete this reply."
                              />
                            ) : null}
                          </div>

                          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">
                            {reply.bodyText}
                          </p>

                          {reply.linkUrl ? (
                            <a
                              href={reply.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-w-0 truncate text-sm text-accent underline underline-offset-2"
                            >
                              {reply.linkUrl}
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <ReplyComposer postId={post.id} />
                </li>
              ))}
            </ol>
          )}

          <PostComposer taskId={row.id} />
        </section>
      </div>
    </div>
  );
}
