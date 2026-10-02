// Local course rows only. This endpoint never calls Google: the sync route writes the rows and
// every reader (subject switcher, board) reads this. Empty array is the correct answer before the
// first sync, not an error.
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const rows = await prisma.courses.findMany({
    select: { id: true, classroomId: true, name: true, section: true, room: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    rows.map((r) => ({ ...r, section: r.section ?? undefined, room: r.room ?? undefined })),
  );
}
