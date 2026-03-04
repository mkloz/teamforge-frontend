/**
 * Animated arrow-right icon that slides in on group hover.
 * Used across all primary CTA buttons.
 */
export function ArrowRightAnimated() {
  return (
    <svg
      className="w-4 h-4 ml-1.5 opacity-0 -translate-x-2 transition-[transform,opacity] duration-200 group-hover:opacity-100 group-hover:translate-x-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}
