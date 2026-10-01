/**
 * Landing-only class strings shared across the section files.
 * The elevation pair is the one shadow from DESIGN.md section 1: tinted cool,
 * never pure black. No literal color values appear in these classes.
 */
export const cardShadow =
  "shadow-[0_1px_2px_rgb(24_24_27/0.04),0_8px_24px_rgb(24_24_27/0.06)]";
/** Hover on a floating card: small rise plus a lift of the same shadow. */
export const cardLift =
  "hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(24_24_27/0.05),0_16px_40px_rgb(24_24_27/0.08)]";

export const eyebrow =
  "text-xs font-medium uppercase tracking-[0.14em] text-muted";

export const focusRing =
  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

/** The one accent CTA on the page. Pill radius, 44px target, one line. */
export const buttonPrimary = `h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent/90 active:scale-[0.98] ${focusRing}`;