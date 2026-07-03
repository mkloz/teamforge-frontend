import { Clapperboard } from "lucide-react";

export function ExpressionEmptyState({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="flex h-92 flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-full border border-border/55 bg-muted/50 text-muted-foreground">
        <Clapperboard className="size-5" />
      </span>
      <p className="font-black text-foreground text-sm">{title}</p>
      <p className="max-w-56 font-medium text-muted-foreground text-xs leading-5">
        {detail}
      </p>
    </div>
  );
}
