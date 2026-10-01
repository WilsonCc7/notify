// Stateless session: cookie value is `${userId}.${hmacSha256(userId, SESSION_SECRET)}`.
// No session table, no JWT lib — node:crypto is already there. googleLinked is derived,
// never stored separately. Cookie name/opts come from lib/auth.ts.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_OPTS } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  googleLinked: boolean;
};

function sign(userId: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(userId)
    .digest("base64url");
}

// Fail closed: unset SESSION_SECRET or a tampered cookie yields no user id, never a user.
function parseCookie(raw: string | undefined): string | null {
  if (!process.env.SESSION_SECRET || !raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = raw.slice(0, dot);
  const given = Buffer.from(raw.slice(dot + 1));
  const want = Buffer.from(sign(userId));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  return userId;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = parseCookie((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatar: true, googleRefreshToken: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    googleLinked: !!user.googleRefreshToken,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

// Route handlers / server actions only: next/headers cookies() is read-only elsewhere.
export async function createSession(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, `${userId}.${sign(userId)}`, SESSION_COOKIE_OPTS);
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
