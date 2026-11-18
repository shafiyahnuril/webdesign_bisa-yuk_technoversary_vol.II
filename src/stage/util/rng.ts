// PRNG LCG deterministik ber-seed agar aset prosedural selalu konsisten.
export type RngFn = () => number;

export function createRng(seed: number): RngFn {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function rngRange(rng: RngFn, min: number, max: number): number {
  return min + (max - min) * rng();
}
