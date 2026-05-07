interface QuestionPageHeaderProps {
  pageNumber: number;
  timeLeftLabel?: string;
  totalPages: number;
}

export function QuestionPageHeader({
  pageNumber,
  timeLeftLabel,
  totalPages,
}: QuestionPageHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
        Page {pageNumber} of {totalPages}
      </span>
      {timeLeftLabel ? (
        <span className="font-sans text-xs font-medium text-muted-foreground/80">
          {timeLeftLabel}
        </span>
      ) : null}
    </div>
  );
}
