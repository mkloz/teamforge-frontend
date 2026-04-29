import { useState } from "react";

export function useUserMenu() {
  const [open, setOpen] = useState(false);

  return {
    open,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
  };
}
