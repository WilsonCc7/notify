// Client leaf for /t/[taskId]: the post composer, one reply composer per post, and the
// delete buttons. Every mutation goes through the thread routes and then router.refresh(),
// so the server component re-reads the thread and the page stays the single source of
// truth. No local copy of the thread, no optimistic list.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowBendUpLeft, PaperPlaneTilt, Trash } from "@phosphor-icons/react";
import { apiError } from "@/components/dashboard/api";

const FIELD =
  "min-h-11 w-full rounded-input border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted disabled:opacity-50";

// Shared by every mutation here: send, surface the server's message, refresh the server
// component so the re-read thread is what the user sees.
function useSend(fallback: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(url: string, payload: Record<string, string>, method: "POST" | "DELETE" = "POST") {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await apiError(res, fallback));
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, send };
}

// One form for both composers: text plus an optional link. v1 has no photo field, so the
// note on the page is the whole explanation of what is missing.
function Composer({
  url,
  submitLabel,
  busyLabel,
  placeholder,
  fallback,
  onSent,
  autoFocus,
}: {
  url: string;
  submitLabel: string;
  busyLabel: string;
  placeholder: string;
  fallback: string;
  onSent?: () => void;
  autoFocus?: boolean;
}) {
  const [bodyText, setBodyText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const { busy, error, send } = useSend(fallback);
  const field = url.replace(/\W/g, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!(await send(url, { bodyText: bodyText.trim(), linkUrl: linkUrl.trim() }))) return;
    setBodyText("");
    setLinkUrl("");
    onSent?.();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <div>
        <label htmlFor={`${field}-body`} className="sr-only">
          {placeholder}
        </label>
        <textarea
          id={`${field}-body`}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          disabled={busy}
          autoFocus={autoFocus}
          aria-invalid={error !== null}
          aria-describedby={error ? `${field}-error` : undefined}
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${field}-link`} className="sr-only">
            Link, optional
          </label>
          <input
            id={`${field}-link`}
            type="url"
            inputMode="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste a link, optional"
            disabled={busy}
            className={`${FIELD} min-h-10`}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60"
        >
          <PaperPlaneTilt size={20} weight="bold" />
          {busy ? busyLabel : submitLabel}
        </button>
      </div>

      {error ? (
        <p id={`${field}-error`} role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function PostComposer({ taskId }: { taskId: string }) {
  return (
    <Composer
      url={`/api/tasks/${encodeURIComponent(taskId)}/posts`}
      submitLabel="Post"
      busyLabel="Posting"
      placeholder="Add a note everyone on this task can read"
      fallback="Could not post that note."
    />
  );
}

export function ReplyComposer({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        <ArrowBendUpLeft size={18} />
        Reply
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <Composer
        url={`/api/posts/${encodeURIComponent(postId)}/replies`}
        submitLabel="Reply"
        busyLabel="Replying"
        placeholder="Write a reply"
        fallback="Could not add that reply."
        onSent={() => setOpen(false)}
        autoFocus
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="justify-self-start text-sm text-muted hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}

export function DeleteButton({ url, label }: { url: string; label: string }) {
  const { busy, error, send } = useSend("Could not delete that.");

  return (
    <div className="grid justify-items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (!window.confirm(`${label} This cannot be undone.`)) return;
          void send(url, {}, "DELETE");
        }}
        aria-label={label}
        className="grid size-11 place-items-center rounded-pill text-muted hover:bg-zinc-100 hover:text-rose-600 disabled:opacity-50 sm:size-9"
      >
        <Trash size={20} />
      </button>
      {error ? (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
