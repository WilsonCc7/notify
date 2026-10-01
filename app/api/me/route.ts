import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });
  return Response.json(user);
}
