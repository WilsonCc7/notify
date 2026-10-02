// Task thread: GET lists the posts with their replies, POST opens a new post.
// Tasks are shared by the whole group, so any signed-in member reads any thread; only the
// author deletes. v1 writes bodyText and linkUrl, never imageUrl (photos land with storage).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { THREAD_INCLUDE, readThreadInput } from "@/lib/thread";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const { id } = await params;
  const task = await prisma.tasks.findUnique({ where: { id }, select: { id: true } });
  if (!task) return fail("That task no longer exists.", 404);

  const posts = await prisma.posts.findMany({
    where: { taskId: id },
    include: THREAD_INCLUDE,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const { id } = await params;
  const task = await prisma.tasks.findUnique({ where: { id }, select: { id: true } });
  if (!task) return fail("That task no longer exists.", 404);

  const input = await readThreadInput(req);
  if (!input.ok) return fail(input.error, 400);

  const post = await prisma.posts.create({
    data: { taskId: id, authorId: user.id, bodyText: input.bodyText, linkUrl: input.linkUrl },
    include: THREAD_INCLUDE,
  });

  return NextResponse.json({ ...post, note: "Photos are not stored yet, so this post is text only." }, { status: 201 });
}