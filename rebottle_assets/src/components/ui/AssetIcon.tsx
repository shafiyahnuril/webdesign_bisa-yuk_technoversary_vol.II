import type { SVGProps } from "react";

const artwork = {
  "alert": <><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></>,
  "arrow-down-right": <><path d="M5 5l14 14M9 19h10V9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "arrow-left": <><path d="M20 12H4m7-7-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "arrow-up-right": <><path d="M5 19L19 5M9 5h10v10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "bin-bottle": <><g transform="translate(12 12) rotate(0) scale(0.56)"><path d="M-5-15H5v6l5 7v13q0 4-4 4H-6q-4 0-4-4V-2l5-7Z" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></g></>,
  "bin-leaf": <><g transform="translate(12 12) rotate(0) scale(0.56)"><path d="M-11 10Q-16-8 13-14Q16 12-5 14ZM-10 14L5-2" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></g></>,
  "bin-paper": <><g transform="translate(12 12) rotate(0) scale(0.56)"><path d="M-12-15H5l7 7v23h-24ZM4-12v7h7" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></g></>,
  "bolt": <><path d="M12.8 2.8 5 14h6l-.8 7.2L19 10h-6l-.2-7.2Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "check": <><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "chevron-down": <><path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "close": <><path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "drop": <><path d="M12 3c-3 4-7 8-7 12a7 7 0 0 0 14 0c0-4-4-8-7-12Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "menu-dots": <><circle cx="5" cy="12" r="3" fill="currentColor"/><circle cx="19" cy="12" r="3" fill="currentColor"/></>,
  "sound-off": <><path d="M5 19 19 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  "sound-on": <><path d="M3 8c3-4 6 4 9 0s6-4 9 0M3 12c3-4 6 4 9 0s6-4 9 0m-18 4c3-4 6 4 9 0s6-4 9 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
};

export type AssetIconName = keyof typeof artwork;

export function AssetIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: AssetIconName }) {
  return (
    <svg {...props} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {artwork[name]}
    </svg>
  );
}
