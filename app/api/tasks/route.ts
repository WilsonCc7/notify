import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { Task, TaskSource, TaskStatus } from "@/lib/contract";

export const dynamic = "force-dynamic";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

type Row = {
  id: string;
  source: string;
  courseId: string | null;
  classroomCourseworkId: string | null;
  title: string;
  description: string | null;
  dueAt: Date | null;
  task_state: { status: string }[];
};

// LEFT JOIN task_state in Prisma terms: the per-user state row when it exists, else todo.
const toTask = (r: Row): Task => ({
  id: r.id,
  source: r.source as TaskSource,
  courseId: r.courseId,
  classroomCourseworkId: r.classroomCourseworkId ?? undefined,
  title: r.title,
  description: r.description ?? undefined,
  dueAt: r.dueAt ? r.dueAt.toISOString() : null,
  status: (r.task_state[0]?.status as TaskStatus | undefined) ?? "todo",
});

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await req.json();
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function isStatus(v: unknown): v is TaskStatus {
  return typeof v === "string" && (STATUSES as string[]).includes(v);
}

// Accepts ISO stamps and the bare YYYY-MM-DD that <input type="date"> sends. UTC midnight
// either way, so a date-only task reads as that day for every timezone.
function parseDue(v: unknown): Date | null | "bad" {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return "bad";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "bad" : d;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const rows = await prisma.tasks.findMany({
    include: { task_state: { where: { userId: user.id } } },
    orderBy: { dueAt: { sort: "asc", nulls: "last" } },
  });

  return NextResponse.json(rows.map(toTask));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const b = await body(req);
  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return fail("Give the task a title.", 400);

  const description = typeof b.description === "string" ? b.description.trim() : null;
  const dueAt = parseDue(b.dueAt);
  if (dueAt === "bad") return fail("That due date is not a date.", 400);

  const courseId = typeof b.courseId === "string" && b.courseId ? b.courseId : null;
  if (courseId) {
    const course = await prisma.courses.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return fail("That course does not exist.", 400);
  }

  const row = await prisma.tasks.create({
    data: {
      source: "custom",
      title,
      description: description || null,
      dueAt,
      courseId,
      task_state: { create: { userId: user.id, status: "todo" } },
    },
    include: { task_state: { where: { userId: user.id } } },
  });

  return NextResponse.json(toTask(row), { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const b = await body(req);
  const id = typeof b.id === "string" ? b.id : "";
  if (!id) return fail("Missing task id.", 400);
  if (!isStatus(b.status)) return fail("Status must be todo, doing, or done.", 400);

  const task = await prisma.tasks.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!task) return fail("That task no longer exists.", 404);

  await prisma.task_state.upsert({
    where: { userId_taskId: { userId: user.id, taskId: id } },
    create: { userId: user.id, taskId: id, status: b.status },
    update: { status: b.status },
  });

  const row = await prisma.tasks.findUniqueOrThrow({
    where: { id },
    include: { task_state: { where: { userId: user.id } } },
  });

  return NextResponse.json(toTask(row));
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const b = await body(req);
  const id = new URL(req.url).searchParams.get("id") || (typeof b.id === "string" ? b.id : "");
  if (!id) return fail("Missing task id.", 400);

  const task = await prisma.tasks.findUnique({ where: { id }, select: { id: true } });
  if (!task) return fail("That task no longer exists.", 404);

  // task_state rows cascade with the task.
  await prisma.tasks.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
