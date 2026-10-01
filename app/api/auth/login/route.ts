// One message for every failure (unknown email, no password set, wrong password) so the
// endpoint cannot be used to enumerate members. Codes: invalid_credentials, blocked.
import { prisma } from "@/lib/db";
import { isEmailAllowed, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const user = email ? await prisma.users.findUnique({ where: { email } }) : null;
  const ok = user?.passwordHash ? await verifyPassword(user.passwordHash, password) : false;
  if (!user || !ok) return Response.json({ error: "invalid_credentials" }, { status: 401 });

  if (!isEmailAllowed(user.email)) return Response.json({ error: "blocked" }, { status: 403 });

  await createSession(user.id);
  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
  });
}