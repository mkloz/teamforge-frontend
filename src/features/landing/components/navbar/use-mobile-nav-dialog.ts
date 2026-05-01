import { useCallback, useEffect, useRef, useState } from "react";

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export function useMobileNavDialog() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const activeElement = document.activeElement;

    previouslyFocusedElementRef.current =
      activeElement instanceof HTMLElement ? activeElement : null;
    document.body.style.overflow = "hidden";

    const focusFirstMenuItem = () => {
      const menu = menuRef.current;
      if (!menu) return;

      getFocusableElements(menu)[0]?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const menu = menuRef.current;

      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !menu) return;

      const focusableElements = getFocusableElements(menu);
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    queueMicrotask(focusFirstMenuItem);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [closeMenu, menuOpen]);

  return {
    closeMenu,
    menuOpen,
    menuRef,
    toggleMenu,
  };
}
