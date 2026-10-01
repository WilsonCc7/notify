import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { GoogleLogo } from "@phosphor-icons/react/dist/ssr/GoogleLogo";
import { FadeRise } from "./FadeRise";
import { buttonPrimary, cardLift, cardShadow, eyebrow } from "./ui";

function DueTaskCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface p-5 ${cardShadow} ${className}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <Clock size={16} weight="bold" className="text-accent" />
        Due today
      </p>
      <div className="mt-4 flex items-center gap-3 rounded-input border border-line p-3">
        <CheckCircle size={20} weight="fill" className="text-muted" />
        <span className="text-sm font-medium text-ink">Problem set 3</span>
        <span className="ml-auto rounded-pill bg-line/60 px-3 py-1 text-xs font-medium text-ink">
          9:00
        </span>
      </div>
    </div>
  );
}

function ClassroomCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface p-5 ${cardShadow} ${className}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <GoogleLogo size={16} weight="bold" className="text-muted" />
        From Classroom
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Link Google once and your coursework lands here on its own.
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted">
        <Check size={16} weight="bold" className="text-accent" />
        Lab report
        <span className="ml-auto text-xs">Added for you</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="px-4 pt-10 md:px-8 md:pt-16">
      <div className="mx-auto max-w-[1400px]">
        <div
          className={`grid items-center gap-10 rounded-card border border-line bg-surface p-6 md:grid-cols-[1.1fr_0.9fr] md:p-12 lg:gap-16 ${cardShadow}`}
        >
          <div>
            <p className={eyebrow}>A planner for your group</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tighter md:text-7xl">
              <span className="block text-ink">Everything due,</span>
              <span className="block text-muted">in one calm list</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted">
              Notify keeps coursework, notes, and due dates in one place, shared
              with the people in your class.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className={`inline-flex ${buttonPrimary}`}>
                Get started
                <ArrowRight size={16} weight="bold" />
              </Link>
              <p className="text-sm text-muted">
                Invitation only. Use the email your group has you on.
              </p>
            </div>
          </div>

          <div className="hidden sm:block md:-mr-6 lg:-mr-10">
            <FadeRise delay={0.03}>
              <DueTaskCard className={`-rotate-2 ${cardLift}`} />
            </FadeRise>
            <FadeRise delay={0.06} className="-mt-10 ml-8 lg:ml-16">
              <ClassroomCard className={`rotate-2 ${cardLift}`} />
            </FadeRise>
          </div>

          <div className="sm:hidden">
            <DueTaskCard />
          </div>
        </div>
      </div>
    </section>
  );
}
