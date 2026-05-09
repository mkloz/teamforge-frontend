const breakpointLabels = [
  { className: "block sm:hidden", label: "xs" },
  { className: "hidden sm:block md:hidden", label: "sm" },
  { className: "hidden md:block lg:hidden", label: "md" },
  { className: "hidden lg:block xl:hidden", label: "lg" },
  { className: "hidden xl:block 2xl:hidden", label: "xl" },
  { className: "hidden 2xl:block", label: "2xl" },
] as const;

export function TailwindIndicator() {
  return (
    <div
      role="status"
      aria-label="Current Tailwind breakpoint"
      className="flex h-5 min-w-6 items-center justify-center rounded-md bg-ink px-1.5 font-bold font-mono text-canvas text-xs leading-none shadow-sm"
    >
      {breakpointLabels.map(({ className, label }) => (
        <span key={label} className={className}>
          {label}
        </span>
      ))}
    </div>
  );
}
