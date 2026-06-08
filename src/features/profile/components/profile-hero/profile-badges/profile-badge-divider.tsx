import { cn } from "@/shared/lib/utils";

export function ProfileBadgeDivider({ className }: { className?: string }) {
  return (
    <div className={cn("h-6 w-px rounded-full bg-slate-muted/20", className)} />
  );
}
