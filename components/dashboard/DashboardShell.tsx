"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowsClockwise, GoogleLogo, SignOut } from "@phosphor-icons/react";
import { FadeRise } from "@/components/landing/FadeRise";
import type { SessionUser } from "@/lib/session";
import type { Task } from "@/lib/contract";
import { TaskRow } from "@/components/dashboard/TaskRow";
import { CreateTaskForm } from "@/components/dashboard/CreateTaskForm";
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

const SOON_MS = 48 * 3600 * 1000;
const CARD =
  "grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";

const dueTime = (t: Task) => (t.dueAt ? new Date(t.dueAt).getTime() : null);

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
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("upcoming");
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

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const all = tasks ?? [];
  const dueSoon = all
    .filter((t) => t.status !== "done" && dueTime(t) !== null && dueTime(t)! - now < SOON_MS)
    .slice(0, 5);
  const lists: Record<Tab, Task[]> = {
    upcoming: all.filter((t) => t.status !== "done" && (dueTime(t) === null || dueTime(t)! >= now)),
    overdue: all.filter((t) => t.status !== "done" && dueTime(t) !== null && dueTime(t)! < now),
    completed: all.filter((t) => t.status === "done"),
  };

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
                onClick={load}
                disabled={refreshing}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-zinc-50 disabled:opacity-60 sm:min-h-10"
              >
                <ArrowsClockwise size={20} />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
              <button
                type="button"
                onClick={() => void fetch("/api/auth/logout", { method: "POST" }).finally(() => location.assign("/"))}
                aria-label="Sign out"
                title="Sign out"
                className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-ink sm:size-10"
              >
                <SignOut size={20} />
              </button>
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
        </FadeRise>

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
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 items-center gap-2 justify-self-start rounded-pill border border-line bg-zinc-100 px-5 text-sm font-medium text-muted disabled:cursor-not-allowed sm:justify-self-end"
            >
              <GoogleLogo size={20} />
              Link Google
            </button>
          </FadeRise>
        )}

        <FadeRise delay={0.06} className={`${CARD} gap-5`}>
          <h2 className="text-lg font-semibold text-ink">New task</h2>
          <CreateTaskForm onCreated={load} />
        </FadeRise>

        {error ? (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <FadeRise delay={0.09} className={CARD}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Due soon</h2>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Next 48h
              </span>
            </div>

            {tasks === null ? (
              <Skeleton rows={4} />
            ) : dueSoon.length === 0 ? (
              <p className="text-base leading-relaxed text-muted">
                Nothing due in the next two days. Add one with the form above.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {dueSoon.map((t) => (
                  <TaskRow key={t.id} task={t} onChange={load} />
                ))}
              </ul>
            )}
          </FadeRise>

          <FadeRise delay={0.12} className={CARD}>
            <h2 className="text-lg font-semibold text-ink">To do</h2>

            <div role="group" aria-label="Filter tasks by status" className="flex flex-wrap gap-2">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={tab === id}
                  onClick={() => setTab(id)}
                  className={`min-h-11 rounded-pill px-4 text-sm font-medium transition-colors ${
                    tab === id
                      ? "bg-accent text-white"
                      : "border border-line bg-surface text-muted hover:bg-zinc-50"
                  }`}
                >
                  {label}
                  {tasks ? ` ${lists[id].length}` : ""}
                </button>
              ))}
            </div>

            {tasks === null ? (
              <Skeleton rows={3} />
            ) : lists[tab].length === 0 ? (
              <p className="text-base leading-relaxed text-muted">{EMPTY[tab]}</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {lists[tab].map((t) => (
                  <TaskRow key={t.id} task={t} onChange={load} />
                ))}
              </ul>
            )}
          </FadeRise>
        </div>
      </div>
    </div>
  );
}
