// Open signup: any valid email registers. Error field carries machine codes
// for the UI to map: invalid_email, weak_password, email_taken.
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export async function POST(req: Request) {
  let body: { email?: unknown; name?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "invalid_email" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (password.length < MIN_PASSWORD) {
    return Response.json({ error: "weak_password" }, { status: 400 });
  }


  const existing = await prisma.users.findUnique({ where: { email }, select: { id: true } });
  if (existing) return Response.json({ error: "email_taken" }, { status: 400 });

  const user = await prisma.users.create({
    data: {
      email,
      name: name || email.split("@")[0],
      passwordHash: await hashPassword(password),
    },
  });
  await createSession(user.id);

  return Response.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}