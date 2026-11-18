// Penanganan masukan gulir, sentuh, keyboard, resize, dan visibilitas di satu tempat (docs/04 §3, §12).

export interface InputCallbacks {
  onScroll(): void;
  onScrollBy(deltaPx: number, pointer?: boolean): void;
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
  const onWheel = (event: WheelEvent) => {
    if (cb.isPaused() || event.ctrlKey || isEditableTarget(event.target)) return;
    if (event.cancelable) event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? cb.getViewportHeight() : 1;
    const delta = event.deltaY * unit;
    const cap = cb.getViewportHeight() * 0.4;
    cb.onScrollBy(Math.max(-cap, Math.min(cap, delta)) * 0.55, true);
  };
  let touchY: number | null = null;
  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (event: TouchEvent) => {
    const nextY = event.touches[0]?.clientY;
    if (nextY === undefined || touchY === null || cb.isPaused() || isEditableTarget(event.target))
      return;
    if (event.cancelable) event.preventDefault();
    const delta = (touchY - nextY) * 0.8;
    touchY = nextY;
    cb.onScrollBy(delta, true);
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
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, PASSIVE);
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("resize", onResize, PASSIVE);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("pageshow", onPageShow);
  document.addEventListener("visibilitychange", onVisibility);

  const vv = window.visualViewport;
  vv?.addEventListener("resize", onResize, PASSIVE);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("pageshow", onPageShow);
    document.removeEventListener("visibilitychange", onVisibility);
    vv?.removeEventListener("resize", onResize);
  };
}
