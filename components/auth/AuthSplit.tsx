import Link from "next/link";
import { CheckCircle, Clock, GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

// One elevation, tinted cool, never pure black (DESIGN.md section 1).
const CARD_SHADOW = "0 1px 2px rgb(24 24 27 / 0.04), 0 8px 24px rgb(24 24 27 / 0.06)";

function ArtPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-accent-soft lg:block">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-surface via-accent-soft to-surface"
      />
      <div className="relative flex h-full items-center justify-center p-16">
        <div className="w-full max-w-md">
          <div
            className="rounded-card border border-line bg-surface p-6 -rotate-3"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              <Clock size={16} aria-hidden />
              Due Friday
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              Problem set 3
            </p>
            <p className="mt-1 text-sm text-muted">Calculus II, section 004</p>
          </div>

          <div
            className="relative z-10 -mt-10 ml-12 rounded-card border border-line bg-surface p-6 rotate-2"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <span className="inline-flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <CheckCircle size={24} weight="fill" className="text-accent" aria-hidden />
              Lab notes
            </span>
            <p className="mt-1 text-sm text-muted">Custom task, done</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Shared auth shell: form on the left, CSS-only art on the right (hidden below lg).
 * Presentational only, no state, safe to import from client or server components.
 */
export function AuthSplit({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-ink"
          >
            Notify
          </Link>

          <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-2 text-base text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-6">
            <a
              href="#"
              aria-disabled="true"
              className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-pill border border-line bg-surface text-sm font-medium text-muted"
            >
              <GoogleLogo size={20} aria-hidden />
              Link Google
            </a>
            <p className="mt-2 text-center text-xs text-muted">
              Classroom link available after sign in.
            </p>
          </div>
        </div>
      </section>

      <ArtPanel />
    </main>
  );
}