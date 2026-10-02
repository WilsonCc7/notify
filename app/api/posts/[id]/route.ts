// Delete one post. Author-only: anyone signed in can read a thread, but nobody edits
// somebody else's words. Replies cascade with the post through the Prisma relation.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const post = await prisma.posts.findUnique({ where: { id }, select: { id: true, authorId: true } });
  if (!post) return NextResponse.json({ error: "That post no longer exists." }, { status: 404 });
  if (post.authorId !== user.id) return NextResponse.json({ error: "Only the author can delete this." }, { status: 403 });

  await prisma.posts.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}