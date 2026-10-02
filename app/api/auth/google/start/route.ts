// Link Google, step 1: bounce to the consent screen. Authed only, and the CSRF `state` is
// `${userId}.${hmac(userId, SESSION_SECRET)}` (lib/google.ts signState) so the callback can prove
// the flow started in this session. Plain 302: a <a href> here must not turn into a POST.
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { buildAuthUrl, googleConfigured, signState } from "@/lib/google";

export async function GET(req: Request) {
  const to = (path: string) => NextResponse.redirect(new URL(path, req.url), 302);

  const user = await getSessionUser();
  if (!user) return to("/login");
  if (!googleConfigured()) return to("/login?error=google_unconfigured");

  return NextResponse.redirect(buildAuthUrl(signState(user.id)), 302);
}
