// Server-safe line glyphs for task kinds. stroke=currentColor, no fills,
// no motion import, so they render in RSC, client, or SVG sprite trees alike.
import type { ReactNode } from "react";

type GlyphProps = {
  size?: number;
  className?: string;
};

function Glyph({
  size,
  className,
  children,
}: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size ?? 20}
      height={size ?? 20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ClassroomCap({ size = 20, className }: GlyphProps) {
  return (
    <Glyph size={size} className={className}>
      <path d="M2.5 8.5 12 4l9.5 4.5L12 13 2.5 8.5Z" />
      <path d="M6.5 10.7v4.6c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.6" />
      <path d="M21.5 8.5v5" />
    </Glyph>
  );
}

export function AssignmentFile({ size = 20, className }: GlyphProps) {
  return (
    <Glyph size={size} className={className}>
      <path d="M6 3h7l5 5v13H6z" />
      <path d="M13 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </Glyph>
  );
}

export function QuizCheck({ size = 20, className }: GlyphProps) {
  return (
    <Glyph size={size} className={className}>
      <path d="M8 4H6.5A1.5 1.5 0 0 0 5 5.5v14A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-14A1.5 1.5 0 0 0 17.5 4H16" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M9 13.5 11.2 15.7 15 11.9" />
    </Glyph>
  );
}

export function MaterialBook({ size = 20, className }: GlyphProps) {
  return (
    <Glyph size={size} className={className}>
      <path d="M12 6.5C10.4 5 8.2 4.3 5 4.3H3v13h2c3.2 0 5.4.7 7 2.2 1.6-1.5 3.8-2.2 7-2.2h2v-13h-2c-3.2 0-5.4.7-7 2.2Z" />
      <path d="M12 6.5v13" />
    </Glyph>
  );
}

export function LinkChain({ size = 20, className }: GlyphProps) {
  return (
    <Glyph size={size} className={className}>
      <path d="M10.2 13.8a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7L11.6 6.7" />
      <path d="M13.8 10.2a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.2-1.2" />
    </Glyph>
  );
}