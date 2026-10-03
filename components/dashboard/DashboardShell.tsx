"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowsClockwise, GoogleLogo, MagnifyingGlass, SignOut } from "@phosphor-icons/react";
import { FadeRise } from "@/components/landing/FadeRise";
import { CompletedArt, OverdueArt, UpcomingArt } from "@/components/icons/EmptyArt";
import type { SessionUser } from "@/lib/session";
import type { Task } from "@/lib/contract";
import { TaskRow } from "@/components/dashboard/TaskRow";
import { CountsRow, UpNext } from "@/components/dashboard/Widgets";
import { QuickAdd } from "@/components/dashboard/QuickAdd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiError } from "@/components/dashboard/api";
type Tab = "upcoming" | "overdue" | "completed";

const TABS: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

const EMPTY: Record<Tab, string> = {
  upcoming: "No upcoming tasks. Add one with the form above.",
  overdue: "Nothing overdue. You are caught up.",
  completed: "Nothing completed yet. Tick a task when it is done.",
};

const EMPTY_ART: Record<Tab, ComponentType<{ className?: string }>> = {
  upcoming: UpcomingArt,
  overdue: OverdueArt,
  completed: CompletedArt,
};

function EmptyState({ tab }: { tab: Tab }) {
  const Art = EMPTY_ART[tab];
  return (
    <div className="grid justify-items-center gap-3">
      <Art className="h-24 w-auto" />
      <p className="text-base leading-relaxed text-muted">{EMPTY[tab]}</p>
      {tab === "upcoming" ? (
        <a
          href="#quickadd"
          onClick={(e) => {
            // Plain fragment nav to a non focusable target blurs the input we just
            // focused, so scroll by hand and keep the caret in the title field.
            e.preventDefault();
            document.getElementById("quickadd")?.scrollIntoView({ block: "center" });
            document.getElementById("quickadd-title")?.focus();
          }}
          className="inline-flex min-h-11 items-center rounded-pill bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent/90 sm:min-h-10"
        >
          Add a task
        </a>
      ) : null}
    </div>
  );
}

const SOON_MS = 48 * 3600 * 1000;
const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";

const NAV: { href: string; label: string }[] = [
  { href: "/s", label: "Boards" },
  { href: "/calendar", label: "Calendar" },
  { href: "#due", label: "Due soon" },
];

const NAV_PILL =
  "inline-flex min-h-10 items-center rounded-pill border border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:bg-zinc-50 hover:text-ink";

const dueTime = (t: Task) => (t.dueAt ? new Date(t.dueAt).getTime() : null);

// High priority first, then soonest due, undated last. Overdue tasks sort by the
// same rule; the merged list only regroups them at the top.
function byPriority(a: Task, b: Task) {
  if (a.priority !== b.priority) return a.priority === "high" ? -1 : 1;
  const da = dueTime(a);
  const db = dueTime(b);
  if (da === null && db === null) return 0;
  if (da === null) return 1;
  if (db === null) return -1;
  return da - db;
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <ul className="grid gap-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="size-10 shrink-0 animate-pulse rounded-pill bg-zinc-100" />
          <span className="h-4 flex-1 animate-pulse rounded-input bg-zinc-100" />
        </li>
      ))}
    </ul>
  );
}

export function DashboardShell({ user }: { user: SessionUser }) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [query, setQuery] = useState("");
  const [pendingSync, setPendingSync] = useState(false);
  const reduced = useReducedMotion();

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      if (!res.ok) throw new Error(await apiError(res, "Could not load your tasks."));
      setTasks((await res.json()) as Task[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your tasks.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Runs after load(), never before it: a failed pull must not empty the board the user is
  // already looking at, it only gets a line of inline copy.
  const sync = useCallback(async () => {
    const res = await fetch("/api/sync/classroom", { method: "POST" });
    if (!res.ok) {
      setSyncError("Classroom sync failed, try Refresh again.");
      return;
    }
    setSyncError(null);
  }, []);

  const refresh = useCallback(async () => {
    await load();
    if (user.googleLinked) await sync();
  }, [load, sync, user.googleLinked]);

  useEffect(() => {
    // /?sync=1 is what the Google callback redirects to: link just stored a refresh token, so
    // pull coursework once before the user sees the board. Unlinked accounts have nothing to
    // pull, and the flag is dropped afterwards so a reload does not re-trigger it.
    if (!user.googleLinked || new URLSearchParams(window.location.search).get("sync") !== "1") {
      load();
      return;
    }
    setPendingSync(true);
    void load()
      .then(sync)
      .finally(() => {
        setPendingSync(false);
        window.history.replaceState(null, "", "/");
      });
  }, [load, sync, user.googleLinked]);

  const now = Date.now();
  const all = tasks ?? [];
  const due48Count = all.filter(
    (t) => t.status !== "done" && dueTime(t) !== null && dueTime(t)! - now >= 0 && dueTime(t)! - now < SOON_MS,
  ).length;
  // One merged "To do": overdue rows lead (TaskRow already paints their rose dot and
  // pulse), each half ordered by byPriority. The Overdue tab stays as a filter.
  const overdue = all
    .filter((t) => t.status !== "done" && dueTime(t) !== null && dueTime(t)! < now)
    .sort(byPriority);
  const notYetDue = all
    .filter((t) => t.status !== "done" && (dueTime(t) === null || dueTime(t)! >= now))
    .sort(byPriority);
  const lists: Record<Tab, Task[]> = {
    upcoming: [...overdue, ...notYetDue],
    overdue,
    completed: all.filter((t) => t.status === "done").sort(byPriority),
  };

  const q = query.trim().toLowerCase();
  const matches = (t: Task) =>
    t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q);
  const visible: Record<Tab, Task[]> = {
    upcoming: q ? lists.upcoming.filter(matches) : lists.upcoming,
    overdue: q ? lists.overdue.filter(matches) : lists.overdue,
    completed: q ? lists.completed.filter(matches) : lists.completed,
  };

  const undone = all.filter((t) => t.status !== "done");
  // UTC Monday boundary. completedAt is set on the flip to done, so the tile counts
  // tasks finished since the week started, not all-time completions.
  const weekStart = new Date();
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  const doneWeek = lists.completed.filter(
    (t) => t.completedAt !== null && new Date(t.completedAt) >= weekStart,
  ).length;

  // Earliest due date in the overdue set. Due dates are date-only (UTC midnight, see
  // parseDue in the tasks route), so format in UTC or it reads a day early west of Greenwich.
  const oldest = overdue.reduce<Task | null>(
    (a, t) => (a === null || dueTime(t)! < dueTime(a)! ? t : a),
    null,
  );
  const oldestDay = oldest?.dueAt
    ? new Date(oldest.dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    : "";
  const upNext = undone.slice().sort(byPriority)[0] ?? null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const first = user.name.trim().split(/\s+/)[0] || user.name;


  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-8 sm:px-8">
        <FadeRise delay={0} className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">notify</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-zinc-50 disabled:opacity-60 sm:min-h-10"
              >
                <ArrowsClockwise size={20} />
                {refreshing || pendingSync ? "Refreshing" : "Refresh"}
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => void fetch("/api/auth/logout", { method: "POST" }).finally(() => location.assign("/"))}
                      aria-label="Sign out"
                      className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-ink sm:size-10"
                    >
                      <SignOut size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Sign out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {user.avatar ? (
                <img src={user.avatar} alt="" className="size-10 shrink-0 rounded-pill object-cover" />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-accent-soft text-sm font-semibold text-accent">
                  {first.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h1 className="text-3xl tracking-tight text-ink">
              <span suppressHydrationWarning className="font-light text-muted">
                {greeting},
              </span>{" "}
              <span className="font-semibold">{first}</span>
            </h1>
            <p suppressHydrationWarning className="text-sm text-muted">
              {today}
            </p>
          </div>

          <nav aria-label="Sections" className="flex flex-wrap items-center gap-2">
            {NAV.map(({ href, label }) =>
              href.startsWith("#") ? (
                <a key={href} href={href} className={NAV_PILL}>
                  {label}
                </a>
              ) : (
                <Link key={href} href={href} className={NAV_PILL}>
                  {label}
                </Link>
              ),
            )}
          </nav>
        </FadeRise>

        {tasks === null ? (
          <Skeleton rows={2} />
        ) : (
          <FadeRise delay={0.015} className="grid gap-6 lg:grid-cols-2">
            <UpNext task={upNext} />
            <CountsRow todo={undone.length} due48={due48Count} done={lists.completed.length} doneWeek={doneWeek} />
          </FadeRise>
        )}

        {user.googleLinked ? null : (
          <FadeRise
            delay={0.03}
            className="grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div>
              <h2 className="text-lg font-semibold text-ink">Link Google</h2>
              <p className="mt-1 text-base leading-relaxed text-muted">
                Link Google to pull coursework from Google Classroom. Custom tasks work right now.
              </p>
            </div>
            <a
              href="/api/auth/google/start"
              className="inline-flex min-h-11 items-center gap-2 justify-self-start rounded-pill border border-line bg-surface px-5 text-sm font-medium text-ink hover:bg-zinc-50 sm:min-h-10 sm:justify-self-end"
            >
              <GoogleLogo size={20} />
              Link Google
            </a>
          </FadeRise>
        )}

        <FadeRise delay={0.06} className={`${CARD} gap-5`}>
          <h2 className="text-lg font-semibold text-ink">New task</h2>
          <QuickAdd onCreated={load} />
        </FadeRise>

        {error ? (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        ) : null}

        {syncError ? (
          <p role="alert" className="text-sm text-rose-600">
            {syncError}
          </p>
        ) : null}

        {tasks !== null && overdue.length > 0 ? (
          <FadeRise
            delay={0.09}
            className="grid gap-3 rounded-card border border-rose-200 bg-rose-50/50 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <p className="text-base leading-relaxed text-rose-700">
              {overdue.length} overdue, oldest: {oldest?.title} ({oldestDay}).
            </p>
            <button
              type="button"
              onClick={() => setTab("overdue")}
              className="inline-flex min-h-11 items-center justify-self-start rounded-pill border border-rose-200 bg-surface px-5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 sm:min-h-10 sm:justify-self-end"
            >
              Review overdue
            </button>
          </FadeRise>
        ) : null}

        <FadeRise delay={0.12} className={`${CARD}`}>
          <h2 id="due" className="scroll-mt-8 text-lg font-semibold text-ink">
            To do
          </h2>

          <div className="relative">
            <MagnifyingGlass
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <label htmlFor="task-search" className="sr-only">
              Search tasks
            </label>
            <input
              id="task-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="min-h-11 w-full rounded-input border border-line bg-surface pl-10 pr-3 text-base text-ink placeholder:text-muted"
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="grid gap-4">
            <TabsList aria-label="Filter tasks by status" className="h-auto w-full flex-wrap justify-start gap-2 rounded-pill bg-transparent p-0">
              {TABS.map(({ id, label }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="min-h-11 rounded-pill! border border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:bg-zinc-50 data-[state=active]:border-accent data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  {label}
                  {tasks ? ` (${visible[id].length})` : ""}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={tab} className="mt-0">
              {tasks === null ? (
                <Skeleton rows={3} />
              ) : (
                <motion.div
                  key={tab}
                  initial={{ opacity: reduced ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, ease: "linear" }}
                >
                  {visible[tab].length === 0 ? (
                    lists[tab].length === 0 ? (
                      <EmptyState tab={tab} />
                    ) : (
                      <p className="text-base leading-relaxed text-muted">No tasks match {q}.</p>
                    )
                  ) : (
                    <ul className="divide-y divide-zinc-100">
                      {visible[tab].map((t) => (
                        <TaskRow key={t.id} task={t} onChange={load} />
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </FadeRise>
      </div>
    </div>
  );
}
