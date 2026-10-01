import Link from "next/link";
import { buttonPrimary, focusRing } from "./ui";

const links = [
  { href: "#features", label: "Features" },
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className={`rounded-input font-display text-xl font-semibold tracking-tight text-ink ${focusRing}`}
        >
          Notify
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Product">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-input text-sm text-muted transition-colors hover:text-ink ${focusRing}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/login"
            className={`inline-flex h-11 items-center rounded-pill px-4 text-sm font-medium text-muted transition-colors hover:text-ink md:h-9 ${focusRing}`}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={`${buttonPrimary} hidden md:inline-flex`}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
