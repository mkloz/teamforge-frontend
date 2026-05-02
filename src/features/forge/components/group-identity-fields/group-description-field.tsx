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
    <div className="space-y-1.5">
      <label
        htmlFor={descId}
        className="block text-xs font-semibold text-muted-foreground/70"
      >
        Description{" "}
        <span className="font-normal text-muted-foreground/40">(optional)</span>
      </label>
      <textarea
        id={descId}
        value={groupDescription}
        maxLength={200}
        rows={2}
        placeholder="What's this group about? A shared goal, project, or interest..."
        onChange={(event) => onGroupDescriptionChange(event.target.value)}
        className={cn(
          "w-full rounded-xl border border-border/60 bg-background/60 px-3.5 py-3 text-sm font-medium",
          "placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/60",
          "focus:ring-2 focus:ring-primary/12 focus:bg-background transition-colors duration-150 resize-none leading-relaxed",
        )}
      />
      {groupDescription.length > 0 && (
        <p className="text-micro text-muted-foreground/40 text-right">
          {groupDescription.length}/200
        </p>
      )}
    </div>
  );
}
