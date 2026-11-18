// Store kecil (subscribe/emit) untuk status lintas komponen. Tanpa react.
export interface Signal<T> {
  get(): T;
  set(next: T): void;
  subscribe(fn: () => void): () => void;
}

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      subs.forEach((fn) => fn());
    },
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

/** Kontrak sinyal cerita. Nilai nyata diisi mesin cerita (T1.2). */
export interface StorySignals {
  shown: number;
  chapter: number;
  babak: 0 | 1 | 2;
  temp: number;
  re: boolean;
  paused: boolean;
}

export const INITIAL_STORY_SIGNALS: StorySignals = {
  shown: 0,
  chapter: 1,
  babak: 1,
  temp: 1.2,
  re: false,
  paused: false,
};

export const storySignals = createSignal<StorySignals>(INITIAL_STORY_SIGNALS);
