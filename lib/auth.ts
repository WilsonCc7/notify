// Auth helpers. Password hashing is argon2id via the `argon2` package — nothing else
// (no scrypt/bcrypt). Session cookie config lives here; routes live in app/api/auth/*.
import { hash, verify } from "argon2";
import { prisma } from "@/lib/db";

const ARGON2_OPTS = {
  // `type` omitted: argon2 defaults to argon2id (its string form throws — type is numeric 0/1/2).
  // Below is the OWASP baseline, not the library default (m=65536,p=4,t=3); verify() reads
  // params from the digest, so hashes made with either setting verify fine.
  memoryCost: 19456, // 19 MiB — OWASP baseline
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTS);
}

export async function verifyPassword(digest: string, password: string): Promise<boolean> {
  try {
    return await verify(digest, password);
  } catch {
    return false; // malformed hash / wrong algo — not a match, never a 500
  }
}

export const SESSION_COOKIE = "notify_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

// CONTRACT merge rule: a verified Google email that already exists links tokens onto
// that row — never a second user. Returns null when no match, so the caller creates the
// user. googleRefreshToken set => linked; otherwise custom tasks only and the UI shows
// the Link Google prompt.
export async function sameEmailLink(
  email: string,
  profile: { name?: string; avatar?: string | null; googleRefreshToken?: string | null },
) {
  const existing = await prisma.users.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!existing) return null;

  return prisma.users.update({
    where: { id: existing.id },
    data: {
      googleRefreshToken: profile.googleRefreshToken ?? existing.googleRefreshToken,
      name: existing.name || profile.name || existing.email,
      avatar: existing.avatar ?? profile.avatar ?? null,
    },
  });
}