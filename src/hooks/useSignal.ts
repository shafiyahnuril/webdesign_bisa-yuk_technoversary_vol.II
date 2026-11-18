import { useSyncExternalStore } from "react";
import { storySignals, type Signal, type StorySignals } from "@/engine/signal";

export function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(signal.subscribe, signal.get, signal.get);
}

/** Kontrak: sinyal cerita untuk React. Dipakai jarang; visual per-frame memakai onFrame. */
export function useStorySignals(): StorySignals {
  return useSignal(storySignals);
}
