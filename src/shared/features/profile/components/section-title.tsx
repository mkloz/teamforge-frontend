import { cn } from "@/shared/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  dotColor?: string;
  className?: string;
  uppercase?: boolean;
}

export function SectionTitle({
  children,
  dotColor = "bg-forge-teal",
  className,
  uppercase = true,
}: SectionTitleProps) {
  return (
    <h3
      className={cn(
        "text-xs font-bold text-ink flex items-center gap-2 tracking-widest",
        uppercase && "uppercase",
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      {children}
    </h3>
  );
}
