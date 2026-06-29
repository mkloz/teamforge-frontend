import { useRef, useState } from "react";

import { useBodyScrollLock } from "@/shared/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/shared/hooks/use-escape-key";
import { useFocusTrap } from "@/shared/hooks/use-focus-trap";

export function useMobileNavDialog() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen((open) => !open);
  }

  useBodyScrollLock({ locked: menuOpen });
  useEscapeKey({ enabled: menuOpen, onEscape: closeMenu });
  useFocusTrap({ enabled: menuOpen, ref: menuRef });

  return {
    closeMenu,
    menuOpen,
    menuRef,
    toggleMenu,
  };
}
