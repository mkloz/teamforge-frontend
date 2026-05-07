import { ArrowRight } from "lucide-react";

/**
 * Animated arrow-right icon that slides in on group hover.
 * Used across all primary CTA buttons.
 */
export function ArrowRightAnimated() {
  return (
    <ArrowRight
      className="ml-1.5 size-4 -translate-x-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
      strokeWidth={2.5}
      aria-hidden="true"
    />
  );
}
