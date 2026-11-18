import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

export function TimeRingArtwork(props: Props) {
  return (
    <svg {...props} viewBox="0 0 140 140" aria-hidden="true" focusable="false">
      <circle cx="70" cy="70" r="62" stroke="currentColor" strokeWidth="1.5"
        strokeOpacity=".24" fill="none" />
      <circle cx="70" cy="70" r="62" pathLength="1" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" fill="none"
        transform="rotate(-90 70 70)" data-time-ring-progress />
    </svg>
  );
}

export function CursorRingArtwork(props: Props) {
  return (
    <svg {...props} viewBox="0 0 46 46" aria-hidden="true" focusable="false">
      <ellipse cx="23" cy="23" rx="21" ry="21" stroke="currentColor"
        strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function StoryHeatFilter({ id }: { id: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false"
      style={{ position: "absolute" }}>
      <defs>
        <filter id={id} x="-15%" y="-25%" width="130%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R"
            yChannelSelector="G" data-heat-scale />
        </filter>
      </defs>
    </svg>
  );
}
