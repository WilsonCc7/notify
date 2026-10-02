// Replies on one post. POST appends a reply; DELETE takes ?id=<replyId> and only the
// author may remove one. Same validation as a post: text plus an optional http(s) link.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { readThreadInput } from "@/lib/thread";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const { id } = await params;
  const post = await prisma.posts.findUnique({ where: { id }, select: { id: true } });
  if (!post) return fail("That post no longer exists.", 404);

  const input = await readThreadInput(req);
  if (!input.ok) return fail(input.error, 400);

  const reply = await prisma.replies.create({
    data: { postId: id, authorId: user.id, bodyText: input.bodyText, linkUrl: input.linkUrl },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(reply, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const replyId = new URL(req.url).searchParams.get("id") ?? "";
  if (!replyId) return fail("Missing reply id.", 400);

  const reply = await prisma.replies.findUnique({
    where: { id: replyId },
    select: { id: true, authorId: true, postId: true },
  });
  if (!reply) return fail("That reply no longer exists.", 404);
  if (reply.authorId !== user.id) return fail("Only the author can delete this.", 403);

  await prisma.replies.delete({ where: { id: replyId } });
  return NextResponse.json({ ok: true });
}