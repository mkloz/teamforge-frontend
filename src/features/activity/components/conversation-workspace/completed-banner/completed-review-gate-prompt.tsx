export function CompletedReviewGatePrompt({
  groupTitle,
}: {
  groupTitle: string;
}) {
  return (
    <div className="flex flex-col gap-1 text-center">
      <p className="font-semibold text-foreground text-sm">
        How was {groupTitle}?
      </p>
      <p className="text-muted-foreground text-xs">
        Leave the teammate reviews still missing for this group.
      </p>
    </div>
  );
}
