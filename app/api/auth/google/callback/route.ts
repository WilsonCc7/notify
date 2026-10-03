// Link Google, step 2: Google redirects here with ?code=...&state=... (or ?error=access_denied when
// the user cancels). The state must verify against SESSION_SECRET before the code is spent. Every
// failure lands on /login?error=<code>. On success: link-or-create the user row, start the session,
// then bounce to the dashboard with ?sync=1 so the first Classroom pull happens right after linking.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sameEmailLink } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { exchangeCode, GoogleError, readState } from "@/lib/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = (path: string) => NextResponse.redirect(new URL(path, url), 302);
  const fail = (error: string) => to(`/login?error=${error}`);

  if (url.searchParams.get("error")) return fail("google_denied");
  if (!readState(url.searchParams.get("state"))) return fail("invalid_state");

  const code = url.searchParams.get("code");
  if (!code) return fail("missing_code");

  let profile;
  try {
    profile = await exchangeCode(code);
  } catch (e) {
    return fail(e instanceof GoogleError ? e.code : "exchange_failed");
  }
  // Merge rule (CONTRACT): a verified Google email that already has a row links tokens onto it.
  const user =
    (await sameEmailLink(profile.email, {
      name: profile.name,
      avatar: profile.avatar,
      googleRefreshToken: profile.refreshToken,
    })) ??
    await prisma.users.create({
      data: {
        email: profile.email,
        name: profile.name || profile.email.split("@")[0],
        avatar: profile.avatar,
        googleRefreshToken: profile.refreshToken,
      },
    });

  await createSession(user.id);
  return to("/?sync=1");
}
