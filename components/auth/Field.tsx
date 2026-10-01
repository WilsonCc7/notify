import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * Labeled text input with inline error or hint. One place for the field chrome so
 * every auth input shares the same height, radius, and error styling.
 */
export function Field({
  label,
  error,
  hint,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  const id = input.id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        {...input}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`h-11 w-full rounded-input border bg-surface px-3 text-base text-ink placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none disabled:opacity-60 ${
          error ? "border-rose-600" : "border-line"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Neutral inline alert. No second accent: only the semantic rose marker. */
export function Alert({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-input border border-rose-600 bg-surface px-4 py-3"
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {children ? <div className="text-sm text-muted">{children}</div> : null}
    </div>
  );
}
