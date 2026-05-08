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
      <span className="font-bold font-sans text-muted-foreground text-xs uppercase tracking-widest">
        Page {pageNumber} of {totalPages}
      </span>
      {timeLeftLabel ? (
        <span className="font-medium font-sans text-muted-foreground/80 text-xs">
          {timeLeftLabel}
        </span>
      ) : null}
    </div>
  );
}
