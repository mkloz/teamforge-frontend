import type { ReactNode } from "react";

export function ActionDialogChildren({ children }: { children: ReactNode }) {
  return children ? <div className="px-6 pb-4">{children}</div> : null;
}
