import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface MessageSkeletonRow {
  align: "center" | "end" | "start";
  id: string;
  kind: "message" | "proposal" | "system";
  lines?: number;
  tone?: "default" | "own";
  widths?: string[];
}

interface MessageListSkeletonPatternProps {
  className?: string;
  includeDatePill?: boolean;
}

const MESSAGE_LIST_SKELETON_ROWS: MessageSkeletonRow[] = [
  {
    align: "end",
    id: "own-wide",
    kind: "message",
    lines: 1,
    tone: "own",
    widths: ["w-72"],
  },
  {
    align: "center",
    id: "system",
    kind: "system",
  },
  {
    align: "start",
    id: "other-reply",
    kind: "message",
    lines: 2,
    widths: ["w-80", "w-56"],
  },
  {
    align: "end",
    id: "proposal",
    kind: "proposal",
    tone: "own",
  },
  {
    align: "start",
    id: "other-follow-up",
    kind: "message",
    lines: 2,
    widths: ["w-72", "w-48"],
  },
];

function getAlignmentClass(align: MessageSkeletonRow["align"]) {
  switch (align) {
    case "center":
      return "justify-center";
    case "end":
      return "justify-end";
    default:
      return "justify-start";
  }
}

export function MessageListSkeletonPattern({
  className,
  includeDatePill = true,
}: MessageListSkeletonPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex min-h-full flex-col gap-5 px-3 py-2", className)}
    >
      {includeDatePill ? (
        <div className="mx-auto">
          <Skeleton shape="pill" className="h-7 w-24" />
        </div>
      ) : null}

      {MESSAGE_LIST_SKELETON_ROWS.map((row) => (
        <div
          key={row.id}
          className={cn("flex gap-3", getAlignmentClass(row.align))}
        >
          {row.kind === "system" ? (
            <Skeleton shape="pill" className="h-6 w-72 max-w-full" />
          ) : (
            <div
              className={cn(
                "max-w-lg rounded-xl border border-border bg-card p-3 shadow-sm",
                row.tone === "own" && "bg-forge-teal/12",
                row.kind === "proposal" && "w-96 max-w-full",
              )}
            >
              {row.kind === "proposal" ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Skeleton shape="circle" className="size-9" tone="amber" />
                    <SkeletonText
                      className="min-w-0 flex-1"
                      lines={2}
                      widths={["w-28", "w-36"]}
                    />
                  </div>
                  <Skeleton shape="pill" className="h-8 w-20 shrink-0" />
                </div>
              ) : (
                <SkeletonText
                  lines={row.lines}
                  widths={row.widths ?? ["w-80", "w-56"]}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
