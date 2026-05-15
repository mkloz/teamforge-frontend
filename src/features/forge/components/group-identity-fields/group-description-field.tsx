import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

interface GroupDescriptionFieldProps {
  descId: string;
  groupDescription: string;
  onGroupDescriptionChange: (value: string) => void;
}

export function GroupDescriptionField({
  descId,
  groupDescription,
  onGroupDescriptionChange,
}: GroupDescriptionFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={descId}
        className="block font-semibold text-muted-foreground/70 text-xs"
      >
        Description{" "}
        <span className="font-normal text-muted-foreground/40">(optional)</span>
      </Label>
      <Textarea
        id={descId}
        value={groupDescription}
        maxLength={200}
        rows={2}
        placeholder="What's this group about? A shared goal, project, or interest..."
        onChange={(event) => onGroupDescriptionChange(event.target.value)}
        className={cn(
          "rounded-xl border-border/60 bg-background/60 px-3.5 py-3 font-medium text-sm",
          "placeholder:text-muted-foreground/35 focus-visible:border-forge-teal/60",
          "resize-none leading-relaxed transition-colors duration-150 focus:bg-background focus:ring-2 focus:ring-forge-teal/10",
        )}
      />
      {groupDescription.length > 0 && (
        <p className="text-right text-micro text-muted-foreground/40">
          {groupDescription.length}/200
        </p>
      )}
    </div>
  );
}
