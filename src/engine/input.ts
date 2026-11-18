// Penanganan masukan gulir, sentuh, keyboard, resize, dan visibilitas di satu tempat (docs/04 §3, §12).

export interface InputCallbacks {
  onScroll(): void;
  onScrollBy(deltaPx: number): void;
  onResize(): void;
  onVisibilityChange(hidden: boolean): void;
  onPageShow(persisted: boolean): void;
  isPaused(): boolean;
  getViewportHeight(): number;
}

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof Element === "undefined" || !(target instanceof Element)) return false;
  if (EDITABLE_TAGS.has(target.tagName)) return true;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  const ce = target.getAttribute("contenteditable");
  if (ce === "" || ce === "true") return true;
  return Boolean(target.closest('[contenteditable=""], [contenteditable="true"]'));
}

function isInteractiveControl(target: EventTarget | null): boolean {
  if (!target || typeof Element === "undefined" || !(target instanceof Element)) return false;
  return Boolean(target.closest('button, a[href], summary, [role="button"], [role="link"]'));
}

const PASSIVE: AddEventListenerOptions = { passive: true };

/** Memasang seluruh listener input Home (wheel/touch/scroll passive) dan mengembalikan fungsi cleanup. */
export function attachStoryInput(cb: InputCallbacks): () => void {
  const onScroll = () => cb.onScroll();
  const onPassiveNoop = () => {
    // Listener passive terdaftar agar jalur roda/sentuh tetap responsif tanpa memblokir compositor.
  };
  const onResize = () => cb.onResize();
  const onVisibility = () => cb.onVisibilityChange(document.hidden);
  const onPageShow = (e: PageTransitionEvent) => cb.onPageShow(e.persisted);

  const onKeyDown = (e: KeyboardEvent) => {
    if (cb.isPaused() || isEditableTarget(e.target)) return;

    // Cegah Home/End (termasuk Ctrl/Meta) agar bab tidak bisa dilewati instan.
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const vh = cb.getViewportHeight();

    if (e.key === "PageDown") {
      e.preventDefault();
      cb.onScrollBy(vh * 0.9);
      return;
    }

    if (e.key === "PageUp") {
      e.preventDefault();
      cb.onScrollBy(-vh * 0.9);
      return;
    }

    if (e.key === " " || e.code === "Space") {
      if (isInteractiveControl(e.target)) return;
      e.preventDefault();
      cb.onScrollBy((e.shiftKey ? -1 : 1) * vh * 0.9);
      return;
    }

    const step = Math.max(48, vh * 0.08);
    if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
      e.preventDefault();
      cb.onScrollBy(step);
      return;
    }

    if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
      e.preventDefault();
      cb.onScrollBy(-step);
    }
  };

  window.addEventListener("scroll", onScroll, PASSIVE);
  window.addEventListener("wheel", onPassiveNoop, PASSIVE);
  window.addEventListener("touchstart", onPassiveNoop, PASSIVE);
  window.addEventListener("touchmove", onPassiveNoop, PASSIVE);
  window.addEventListener("resize", onResize, PASSIVE);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("pageshow", onPageShow);
  document.addEventListener("visibilitychange", onVisibility);

  const vv = window.visualViewport;
  vv?.addEventListener("resize", onResize, PASSIVE);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", onPassiveNoop);
    window.removeEventListener("touchstart", onPassiveNoop);
    window.removeEventListener("touchmove", onPassiveNoop);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("pageshow", onPageShow);
    document.removeEventListener("visibilitychange", onVisibility);
    vv?.removeEventListener("resize", onResize);
  };
}
