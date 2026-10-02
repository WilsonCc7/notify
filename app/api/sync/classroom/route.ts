// Pull Google Classroom into the local DB. Refresh token comes straight from prisma (not
// /api/me, which carries no token) and is exchanged for a short-lived access token on every run.
// Upsert only: no delete, no prune. Classroom keeps its own history, and a coursework that leaves
// the PUBLISHED set must not silently wipe a task the user has already moved to Done.
// task_state is created once as todo and never touched again, so a re-sync cannot undo progress.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  descriptionOf,
  dueAt,
  isInvalidGrant,
  listActiveCourses,
  listPublishedCoursework,
  refreshAccessToken,
} from "@/lib/google";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST() {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);

  const row = await prisma.users.findUnique({
    where: { id: user.id },
    select: { googleRefreshToken: true },
  });
  const refreshToken = row?.googleRefreshToken;
  if (!refreshToken) return fail("not_linked", 409);

  let accessToken: string;
  try {
    accessToken = await refreshAccessToken(refreshToken);
  } catch (e) {
    // Revoked or expired grant: forget the token so the UI shows the Link Google prompt again.
    if (isInvalidGrant(e)) {
      await prisma.users.update({ where: { id: user.id }, data: { googleRefreshToken: null } });
      return fail("not_linked", 409);
    }
    return fail("Could not reach Google. Try again.", 502);
  }

  let courses, works = 0;
  try {
    courses = await listActiveCourses(accessToken);
  } catch {
    return fail("Could not reach Google. Try again.", 502);
  }

  for (const course of courses) {
    let coursework;
    try {
      coursework = await listPublishedCoursework(accessToken, course.id);
    } catch {
      // One unreadable course must not sink the whole sync.
      continue;
    }

    const local = await prisma.courses.upsert({
      where: { classroomId: course.id },
      create: {
        classroomId: course.id,
        name: course.name || course.id,
        section: course.section || null,
        room: course.room || null,
      },
      update: {
        name: course.name || course.id,
        section: course.section || null,
        room: course.room || null,
      },
    });

    for (const work of coursework) {
      // CourseWork ids are unique per course, not globally, so the key carries the course.
      const classroomCourseworkId = `${course.id}:${work.id}`;
      const data = {
        title: work.title || "Untitled",
        description: descriptionOf(work),
        dueAt: dueAt(work),
        courseId: local.id,
      };
      await prisma.tasks.upsert({
        where: { classroomCourseworkId },
        create: {
          source: "classroom",
          classroomCourseworkId,
          title: data.title,
          description: data.description,
          dueAt: data.dueAt,
          courseId: local.id,
          task_state: { create: { userId: user.id, status: "todo" } },
        },
        update: data,
      });
      works += 1;
    }
  }

  return NextResponse.json({ courses: courses.length, tasks: works });
}
