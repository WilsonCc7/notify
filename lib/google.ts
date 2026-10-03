// Google OAuth + Classroom API. `google-auth-library` only, never `googleapis`: v1 needs the
// OAuth2 client and id_token verification, not a generated API surface. Classroom calls are
// plain fetch against the REST endpoints (CONTRACT scopes, no Gmail/Calendar/Drive).
import { createHmac, timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

// CONTRACT.md: exactly these five, space-delimited in the consent screen.
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
].join(" ");

const CLASSROOM = "https://classroom.googleapis.com/v1";

export class GoogleError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

// The token endpoint answers 400 with { error: "invalid_grant" } when the user revoked access or
// the grant expired. gaxios surfaces it on `response.data` and in the message, so check both.
export function isInvalidGrant(e: unknown): boolean {
  const err = e as { response?: { data?: { error?: string } }; message?: string } | null;
  return err?.response?.data?.error === "invalid_grant" || /invalid_grant/.test(err?.message ?? "");
}

function envConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "";
  return { clientId, clientSecret, redirectUri };
}

export function googleConfigured(): boolean {
  const { clientId, clientSecret, redirectUri } = envConfig();
  return Boolean(clientId && clientSecret && redirectUri);
}

function client(): OAuth2Client {
  const { clientId, clientSecret, redirectUri } = envConfig();
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

// access_type=offline is what makes Google hand back a refresh_token; prompt=consent forces a new
// one on every link instead of silently reusing a prior grant. Both are required or linking
// produces a user with no stored token.
export function buildAuthUrl(state: string): string {
  return client().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state,
  });
}

export type GoogleProfile = { email: string; name?: string; avatar?: string | null };

// Throws GoogleError("unverified_email") when Google says the address is not verified: the
// allowlist gate trusts nothing else.
export async function exchangeCode(code: string): Promise<GoogleProfile & { refreshToken: string | null }> {
  const { clientId } = envConfig();
  const { tokens } = await client().getToken(code);
  if (!tokens.id_token) throw new GoogleError("missing_id_token");

  const ticket = await client().verifyIdToken({ idToken: tokens.id_token, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.email || payload.email_verified !== true) throw new GoogleError("unverified_email");

  return {
    email: payload.email.toLowerCase(),
    name: payload.name,
    avatar: payload.picture ?? null,
    refreshToken: tokens.refresh_token ?? null,
  };
}

// `refreshToken()` is protected in google-auth-library v11; the public door is credentials +
// refreshAccessToken(), which POSTs the same grant_type=refresh_token to the token endpoint.
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const c = client();
  c.credentials.refresh_token = refreshToken;
  const { credentials } = await c.refreshAccessToken();
  if (!credentials.access_token) throw new GoogleError("no_access_token");
  return credentials.access_token;
}

// CSRF state: `${userId}.${hmac(userId, SESSION_SECRET)}`, the same shape as the session cookie
// (lib/session.ts). Fails closed with no SESSION_SECRET: an empty key would be forgeable.
export function signState(userId: string): string {
  const sig = createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(userId)
    .digest("base64url");
  return `${userId}.${sig}`;
}

export function readState(state: string | null): string | null {
  if (!process.env.SESSION_SECRET || !state) return null;
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = state.slice(0, dot);
  const given = Buffer.from(state.slice(dot + 1));
  const want = Buffer.from(signState(userId).slice(userId.length + 1));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  return userId;
}

export type GCourse = { id: string; name?: string; section?: string; room?: string };
export type GDate = { year: number; month: number; day: number };
export type GTime = { hours?: number; minutes?: number; seconds?: number };
export type GWork = {
  id: string;
  title?: string;
  description?: string;
  textDescription?: string;
  dueDate?: GDate;
  dueTime?: GTime;
};

// Both list endpoints page the same way: a `key` array plus nextPageToken on the body.
async function listAll<T>(base: string, accessToken: string, key: string): Promise<T[]> {
  const out: T[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${CLASSROOM}${base}`);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) throw new GoogleError(`classroom_${res.status}`);

    const body = (await res.json()) as Record<string, unknown> & { nextPageToken?: string };
    out.push(...((body[key] as T[] | undefined) ?? []));
    pageToken = body.nextPageToken || undefined;
  } while (pageToken);

  return out;
}

export function listActiveCourses(accessToken: string): Promise<GCourse[]> {
  return listAll<GCourse>("/courses?studentId=me&courseStates=ACTIVE", accessToken, "courses");
}

export function listPublishedCoursework(accessToken: string, courseId: string): Promise<GWork[]> {
  return listAll<GWork>(
    `/courses/${encodeURIComponent(courseId)}/courseWork?courseWorkStates=PUBLISHED`,
    accessToken,
    "courseWork",
  );
}

// Classroom dueDate is a plain civil date and dueTime an offset-free clock time, so both map
// straight onto a UTC instant. Date-only coursework lands on UTC midnight of that day.
export function dueAt(work: GWork): Date | null {
  const d = work.dueDate;
  if (!d) return null;
  return new Date(
    Date.UTC(d.year, d.month - 1, d.day, work.dueTime?.hours ?? 0, work.dueTime?.minutes ?? 0, work.dueTime?.seconds ?? 0),
  );
}

// textDescription is the HTML body Classroom renders; the task list shows plain text.
export function descriptionOf(work: GWork): string | null {
  const plain = work.description?.trim() || work.textDescription?.replace(/<[^>]*>/g, "").trim() || "";
  return plain || null;
}
