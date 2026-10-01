import type { ReactNode } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { GoogleLogo } from "@phosphor-icons/react/dist/ssr/GoogleLogo";
import { ListChecks } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { FadeRise } from "./FadeRise";
import { cardShadow, eyebrow } from "./ui";

const features = [
  {
    icon: ListChecks,
    title: "Everything due, soonest first",
    body: "One list for every course you are in. Each task keeps its title, its note, and its due date.",
  },
  {
    icon: CheckCircle,
    title: "Done stays done",
    body: "Mark a task finished once. It keeps its place in your history instead of coming back tomorrow.",
  },
  {
    icon: PencilSimple,
    title: "Add your own",
    body: "Reading, a problem set, a lab writeup. Anything your classes do not track sits next to the rest.",
  },
];

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="mt-0.5 inline-flex rounded-input border border-line p-2.5 text-accent">
      {children}
    </span>
  );
}

export function ValueBand() {
  return (
    <>
      <section id="features" className="scroll-mt-16 px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <p className={eyebrow}>What you get</p>
            <h2 className="mt-4 font-display text-3xl tracking-tight text-ink md:text-4xl">
              The list you actually keep
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">
              Notify holds what your classes hand you and what you hand yourself,
              in one place you can read in a minute.
            </p>

            <ul className="mt-10 space-y-6">
              {features.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <IconTile>
                    <feature.icon size={20} />
                  </IconTile>
                  <div>
                    <p className="text-lg font-semibold text-ink">{feature.title}</p>
                    <p className="mt-1 max-w-[52ch] text-base leading-relaxed text-muted">
                      {feature.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <FadeRise delay={0.03}>
            <div className={`rounded-card border border-line bg-surface p-5 ${cardShadow}`}>
              <p className="text-sm font-medium text-ink">Due soon</p>
              <ul className="mt-4 space-y-2">
                {[
                  { title: "Problem set 3", meta: "Physics 101, today" },
                  { title: "Lab report", meta: "Chemistry, Friday" },
                  { title: "Reading notes", meta: "History, next week" },
                ].map((row) => (
                  <li
                    key={row.title}
                    className="flex items-center gap-3 rounded-input border border-line px-3 py-2.5"
                  >
                    <CheckCircle
                      size={20}
                      weight="fill"
                      className="text-muted"
                    />
                    <span className="text-sm font-medium text-ink">{row.title}</span>
                    <span className="ml-auto text-xs text-muted">{row.meta}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeRise>
        </div>
      </section>

      <section id="solutions" className="scroll-mt-16 px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1fr_2fr] md:items-center">
          <FadeRise delay={0.03}>
            <div className={`rounded-card border border-line bg-surface p-5 ${cardShadow}`}>
              <p className="text-sm font-medium text-ink">How you get in</p>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3 rounded-input border border-line p-3">
                  <ShieldCheck size={20} className="shrink-0 text-accent" />
                  <span className="text-sm leading-relaxed text-muted">
                    Your email has to be on the list before you can register.
                  </span>
                </li>
                <li className="flex gap-3 rounded-input border border-line p-3">
                  <GoogleLogo
                    size={20}
                    className="shrink-0 text-muted"
                  />
                  <span className="text-sm leading-relaxed text-muted">
                    Link Google once and your Classroom coursework comes over on
                    its own.
                  </span>
                </li>
              </ul>
            </div>
          </FadeRise>

          <div className="md:pl-6">
            <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
              Your people, not the whole school
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">
              Notify stays small on purpose. Everyone in it is someone you
              actually share work with, so a due date means the same thing to
              all of you.
            </p>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">
              No seats to buy, no teams to configure, no feed to scroll. You get
              in, you see the list, you get on with it.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}