import { useCallback, useRef, useSyncExternalStore } from "react";
import { storyEngine, type StoryEngine, type StoryState } from "@/engine/story-engine";

export interface ChapterSnapshot {
  chapter: number;
  view: StoryState["view"];
}

/**
 * Hook React untuk membaca bab aktif dan tampilan penanda bab.
 * Hanya memicu re-render saat bab atau view berganti (bukan per frame).
 */
export function useChapter(engine: StoryEngine = storyEngine): ChapterSnapshot {
  const cacheRef = useRef<ChapterSnapshot>({
    chapter: engine.state.chapter,
    view: engine.state.view,
  });

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      engine.onChapter((chapter, view) => {
        if (cacheRef.current.chapter !== chapter || cacheRef.current.view !== view) {
          cacheRef.current = { chapter, view };
          onStoreChange();
        }
      }),
    [engine],
  );

  const getSnapshot = useCallback((): ChapterSnapshot => {
    const { chapter, view } = engine.state;
    if (cacheRef.current.chapter !== chapter || cacheRef.current.view !== view) {
      cacheRef.current = { chapter, view };
    }
    return cacheRef.current;
  }, [engine]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
