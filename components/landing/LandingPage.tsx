import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Hero } from "./Hero";
import { SiteNav } from "./SiteNav";
import { ValueBand } from "./ValueBand";
import { buttonPrimary, cardShadow, eyebrow } from "./ui";
import { FadeRise } from "./FadeRise";

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />

      <main className="flex-1">
        <Hero />
        <ValueBand />

        <section id="how-it-works" className="scroll-mt-16 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <FadeRise>
              <p className={eyebrow}>How it works</p>
            </FadeRise>
            <FadeRise delay={0.03}>
              <ol className="mt-6 flex flex-col gap-3 text-base leading-relaxed text-muted">
                <li>
                  <span className="mr-2 font-semibold text-accent">1</span>
                  Register with the email your group has you on.
                </li>
                <li>
                  <span className="mr-2 font-semibold text-accent">2</span>
                  Link Google once, coursework lands on its own.
                </li>
                <li>
                  <span className="mr-2 font-semibold text-accent">3</span>
                  Mark done, it stays done.
                </li>
              </ol>
            </FadeRise>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-16 px-4 pb-20 md:px-8">
          <div
            className={`mx-auto max-w-[1400px] rounded-card border border-line bg-surface p-8 text-center md:p-14 ${cardShadow}`}
          >
            <h2 className="mx-auto max-w-[20ch] font-display text-3xl tracking-tight text-ink md:text-4xl">
              One group, no plan to choose
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-muted">
              Register with the email your group has you on. Your courses and
              their due dates are waiting on the other side.
            </p>
            <Link href="/register" className={`mt-8 inline-flex ${buttonPrimary}`}>
              Get started
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-ink">Notify</p>
            <p className="mt-1 text-sm text-muted">
              One calm place for coursework, notes, and due dates.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted">
            <a
              href="mailto:angwilson127@gmail.com"
              className="underline underline-offset-2"
            >
              angwilson127@gmail.com
            </a>
            <span>081292336806</span>
          </div>
        </div>
      </footer>
    </div>
  );
}