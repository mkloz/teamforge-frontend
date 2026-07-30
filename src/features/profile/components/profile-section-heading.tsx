import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface ProfileSectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function ProfileSectionHeading({
  children,
  className,
}: ProfileSectionHeadingProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <h2 className="font-extrabold text-ink/72 text-sm">{children}</h2>
    </div>
  );
}
