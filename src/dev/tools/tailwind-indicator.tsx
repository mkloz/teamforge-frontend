const breakpointLabels = [
  { className: "block sm:hidden", label: "xs" },
  { className: "hidden sm:block md:hidden", label: "sm" },
  { className: "hidden md:block lg:hidden", label: "md" },
  { className: "hidden lg:block xl:hidden", label: "lg" },
  { className: "hidden xl:block 2xl:hidden", label: "xl" },
  { className: "hidden 2xl:block", label: "2xl" },
] as const;

export function TailwindBreakpointBadge() {
  return (
    <span className="absolute -right-0.5 -bottom-0.5 flex min-w-4 items-center justify-center rounded-full border border-card bg-foreground px-1 font-bold font-mono text-[8px] text-background leading-4">
      <span className="sr-only">Current breakpoint: </span>
      {breakpointLabels.map(({ className, label }) => (
        <span key={label} className={className}>
          {label}
        </span>
      ))}
    </span>
  );
}
