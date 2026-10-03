"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { Alert, Field } from "@/components/auth/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_COPY: Record<string, string> = {
  invalid_email: "That email address looks wrong.",
  weak_password: "Use a password of at least 8 characters.",
  email_taken: "That email already has an account.",
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmed = email.trim();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(trimmed)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          name: name.trim() || undefined,
          password,
        }),
      });

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
    <AuthSplit title="Create your account" subtitle="One shared list for the people in your group.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? <Alert title={formError} /> : null}


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
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Ada"
          hint="Optional. Shown next to the tasks you post."
          value={name}
          disabled={pending}
          onChange={(e) => setName(e.target.value)}
        />

        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
          {pending ? "Creating account" : "Create account"}
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </form>
    </AuthSplit>
  );
}