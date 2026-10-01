"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { Alert, Field } from "@/components/auth/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_COPY: Record<string, string> = {
  invalid_credentials: "Email or password is wrong.",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setBlocked(false);

    const trimmed = email.trim();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(trimmed)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });

      if (res.status === 403) {
        setBlocked(true);
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setFormError(ERROR_COPY[body?.error ?? ""] ?? "That did not work. Try again.");
        return;
      }
      router.push("/");
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthSplit title="Welcome back" subtitle="Sign in to see what is due.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? <Alert title={formError} /> : null}

        {blocked ? (
          <Alert title="That email is not on the list yet.">
            <p>
              Notify is invite only.{" "}
              <Link
                href="/blocked"
                className="font-medium text-ink underline underline-offset-2"
              >
                See why
              </Link>
              , or{" "}
              <Link
                href="/register"
                className="font-medium text-ink underline underline-offset-2"
              >
                create an account
              </Link>
              .
            </p>
          </Alert>
        ) : null}

        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@school.edu"
          value={email}
          error={errors.email}
          disabled={pending}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          error={errors.password}
          disabled={pending}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 rounded-pill bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in" : "Sign in"}
        </button>

        <p className="text-center text-sm text-muted">
          No account yet?{" "}
          <Link
            href="/register"
            className="font-medium text-ink underline underline-offset-2"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthSplit>
  );
}