import { ArrowRight, FilePlus2 } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface StartBlankTemplateButtonProps {
  onStartBlank: () => void;
}

export function StartBlankTemplateButton({
  onStartBlank,
}: StartBlankTemplateButtonProps) {
  return (
    <button
      type="button"
      onClick={onStartBlank}
      className="flex w-full items-center gap-3 rounded-lg border border-border/50 border-dashed bg-background/40 px-3.5 py-3 text-left transition-colors duration-200 hover:border-forge-teal/30 hover:bg-forge-teal/5 active:scale-95"
    >
      <IconTile icon={FilePlus2} size="lg" tone="neutral" className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground text-sm leading-tight">
          Start blank
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-snug">
          Keep your category and fill the plan yourself.
        </p>
      </div>
      <ArrowRight size={14} className="text-muted-foreground" />
    </button>
  );
}
