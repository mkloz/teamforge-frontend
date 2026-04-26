import { cn } from "@/shared/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  dotColor?: string;
  className?: string;
}

export function SectionTitle({
  children,
  dotColor = "bg-forge-teal",
  className,
}: SectionTitleProps) {
  return (
    <h3
      className={cn(
        "text-xs uppercase tracking-widest font-bold text-slate-muted flex items-center gap-2.5",
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      {children}
    </h3>
  );
}
