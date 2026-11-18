import { useEffect, type RefObject } from "react";

export interface UseFocusTrapOptions {
  /** Apakah focus trap sedang aktif. */
  active: boolean;
  /** Wadah utama dialog/panel yang dikunci fokusnya. */
  containerRef: RefObject<HTMLElement | null>;
  /** Tombol pemicu di luar wadah (mis. MenuButton di Navbar) yang ikut dalam siklus Tab dan menerima fokus saat ditutup. */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Callback saat pengguna menekan Escape. */
  onEscape?: () => void;
  /** Elemen spesifik yang difokuskan pertama kali saat dibuka (opsional; default elemen fokusable pertama di dalam container). */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function isVisible(el: HTMLElement): boolean {
  if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function getFocusableElements(
  container: HTMLElement | null,
  trigger: HTMLElement | null,
): HTMLElement[] {
  const list: HTMLElement[] = [];
  if (container) {
    const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    nodes.forEach((node) => {
      if (isVisible(node)) list.push(node);
    });
  }
  if (trigger && isVisible(trigger) && !list.includes(trigger)) {
    list.push(trigger);
  }
  return list;
}

/**
 * Mengunci fokus keyboard di dalam `containerRef` (plus `triggerRef` bila disertakan),
 * menangani tombol `Escape`, memindahkan fokus awal ke elemen pertama saat aktif,
 * dan mengembalikan fokus ke `triggerRef` saat dinonaktifkan.
 */
export function useFocusTrap({
  active,
  containerRef,
  triggerRef,
  onEscape,
  initialFocusRef,
}: UseFocusTrapOptions): void {
  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    const trigger = triggerRef?.current ?? null;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Pindahkan fokus ke tautan/elemen pertama di dalam panel
    const focusInitial = () => {
      if (initialFocusRef?.current && isVisible(initialFocusRef.current)) {
        initialFocusRef.current.focus();
        return;
      }
      const inContainer = getFocusableElements(container, null);
      if (inContainer[0]) {
        inContainer[0].focus();
      } else if (container) {
        container.focus();
      }
    };

    focusInitial();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = getFocusableElements(containerRef.current, triggerRef?.current ?? null);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const current = document.activeElement as HTMLElement | null;
      const idx = current ? focusables.indexOf(current) : -1;

      if (event.shiftKey) {
        if (idx <= 0) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (idx === -1 || idx >= focusables.length - 1) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const returnTarget = trigger ?? previouslyFocused;
      if (returnTarget && typeof returnTarget.focus === "function") {
        returnTarget.focus();
      }
    };
  }, [active, containerRef, triggerRef, onEscape, initialFocusRef]);
}
