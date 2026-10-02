// Server-safe empty-state scenes. Two illustration hues per scene, tints at
// 18-25% opacity, strokes at full hue. Neutral ink for structure only, so the
// hues stay decoration. No text, no motion, no em-dashes.
import type { ReactNode } from "react";

type ArtProps = {
  className?: string;
};

const INK = "#3F3F46";

function Scene({
  className,
  children,
}: ArtProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function UpcomingArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      {/* sky + amber */}
      <circle cx="118" cy="26" r="13" fill="#0EA5E9" fillOpacity="0.2" />
      <rect x="30" y="22" width="86" height="72" rx="14" fill="#0EA5E9" fillOpacity="0.18" />
      <rect x="30" y="22" width="86" height="18" rx="9" fill="#0EA5E9" fillOpacity="0.24" />
      <rect x="30" y="34" width="86" height="6" fill="#0EA5E9" fillOpacity="0.24" />
      <path d="M52 16v12M94 16v12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="30" y="22" width="86" height="72" rx="14" stroke={INK} strokeWidth="3" />
      <circle cx="52" cy="58" r="4" fill="#F59E0B" fillOpacity="0.22" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="72" cy="58" r="4" fill="#F59E0B" fillOpacity="0.22" stroke="#F59E0B" strokeWidth="2.5" />
      <rect x="44" y="72" width="46" height="6" rx="3" fill="#F59E0B" fillOpacity="0.22" />
      <path d="M124 62v14l10 6" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="124" cy="62" r="19" fill="#F59E0B" fillOpacity="0.18" stroke={INK} strokeWidth="3" />
    </Scene>
  );
}

export function OverdueArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      {/* rose + amber */}
      <path d="M118 22a13 13 0 0 1 12.6 16" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
      <circle cx="118" cy="22" r="13" fill="#F43F5E" fillOpacity="0.2" />
      <rect x="26" y="26" width="80" height="68" rx="14" fill="#F43F5E" fillOpacity="0.18" />
      <path d="M26 48h80" stroke={INK} strokeWidth="3" />
      <path d="M48 20v12M84 20v12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="26" y="26" width="80" height="68" rx="14" stroke={INK} strokeWidth="3" />
      <path d="M40 62h26M40 74h16" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
      <circle cx="116" cy="72" r="21" fill="#F43F5E" fillOpacity="0.2" stroke={INK} strokeWidth="3" />
      <path d="M116 60v13l9 5" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Scene>
  );
}

export function CompletedArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      {/* emerald + sky */}
      <rect x="22" y="26" width="82" height="66" rx="14" fill="#0EA5E9" fillOpacity="0.18" />
      <rect x="22" y="26" width="82" height="16" rx="8" fill="#0EA5E9" fillOpacity="0.22" />
      <rect x="22" y="36" width="82" height="6" fill="#0EA5E9" fillOpacity="0.22" />
      <rect x="22" y="26" width="82" height="66" rx="14" stroke={INK} strokeWidth="3" />
      <path d="M36 60h22M36 72h30" stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" />
      <circle cx="114" cy="68" r="24" fill="#10B981" fillOpacity="0.2" stroke={INK} strokeWidth="3" />
      <path d="M104 68.5l7 7 13-14" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M126 30l2.4 5 5.6.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.6-.8 2.4-5Z" fill="#10B981" fillOpacity="0.22" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
    </Scene>
  );
}