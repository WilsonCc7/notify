// Thread read shape + input validation shared by the thread routes and /t/[taskId].
// v1 is text plus an optional link: posts.imageUrl stays null until object storage is
// configured, so nothing here carries a photo. One include for every reader, so a field
// added to a post shows up in the API and the page together.
import type { Prisma } from "@prisma/client";

export const MAX_BODY = 2000;

const AUTHOR = { select: { id: true, name: true } } as const;

export const THREAD_INCLUDE = {
  author: AUTHOR,
  replies: { orderBy: { createdAt: "asc" }, include: { author: AUTHOR } },
} as const;

export type PostRow = Prisma.postsGetPayload<{ include: typeof THREAD_INCLUDE }>;
export type ReplyRow = PostRow["replies"][number];

export type ThreadInput = { ok: true; bodyText: string; linkUrl: string | null } | { ok: false; error: string };

// http/https only. A stored href renders as an anchor, so javascript: and data: would run
// on click; anything that is not an absolute http(s) URL is rejected at the boundary.
function parseLink(v: unknown): string | null | "bad" {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return "bad";
  let url: URL;
  try {
    url = new URL(v.trim());
  } catch {
    return "bad";
  }
  return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "bad";
}

// Same rules for a post and a reply: trimmed text, 1 to MAX_BODY chars, optional link.
export async function readThreadInput(req: Request): Promise<ThreadInput> {
  let b: Record<string, unknown> = {};
  try {
    const parsed: unknown = await req.json();
    b = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    b = {};
  }

  const bodyText = typeof b.bodyText === "string" ? b.bodyText.trim() : "";
  if (!bodyText) return { ok: false, error: "Write something before sending." };
  if (bodyText.length > MAX_BODY) return { ok: false, error: `Keep it under ${MAX_BODY} characters.` };

  const linkUrl = parseLink(b.linkUrl);
  if (linkUrl === "bad") return { ok: false, error: "That link has to be an http or https address." };

  return { ok: true, bodyText, linkUrl };
}