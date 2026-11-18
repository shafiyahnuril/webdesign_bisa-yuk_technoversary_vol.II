import { useSyncExternalStore } from "react";

function subscribeTo(query: string) {
  return (cb: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** Berlangganan media query; aman bila matchMedia tidak ada. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    subscribeTo(query),
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches,
    () => false,
  );
}
