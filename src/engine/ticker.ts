import { gsap } from "gsap";

/** Pembungkus gsap.ticker; dt dalam DETIK (bukan milidetik). */
export type TickFn = (dt: number) => void;

export function onTick(fn: TickFn): () => void {
  const handler = (_time: number, deltaMs: number) => fn(deltaMs / 1000);
  gsap.ticker.add(handler);
  return () => {
    gsap.ticker.remove(handler);
  };
}
