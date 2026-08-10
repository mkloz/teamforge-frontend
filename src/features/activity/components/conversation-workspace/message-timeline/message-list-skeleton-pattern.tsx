import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
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

const MESSAGE_SKELETON_ALIGNMENT_CLASSES = {
  center: "justify-center",
  end: "justify-end",
  start: "justify-start",
} as const satisfies Record<MessageSkeletonRow["align"], string>;

export function MessageListSkeletonPattern({
  className,
  includeDatePill = true,
}: MessageListSkeletonPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex min-h-full flex-col gap-4", className)}
    >
      {includeDatePill ? (
        <div className="mx-auto">
          <Skeleton shape="pill" className="h-6 w-16" />
        </div>
      ) : null}

      {MESSAGE_LIST_SKELETON_ROWS.map((row) => (
        <div
          key={row.id}
          className={cn("flex gap-3", getAlignmentClass(row.align))}
        >
          <MessageSkeletonRowContent row={row} />
        </div>
      ))}
    </div>
  );
}

function getAlignmentClass(align: MessageSkeletonRow["align"]) {
  return MESSAGE_SKELETON_ALIGNMENT_CLASSES[align];
}

function MessageSkeletonRowContent({ row }: { row: MessageSkeletonRow }) {
  if (row.kind === "system") {
    return <Skeleton shape="pill" className="h-6 w-80 max-w-full" />;
  }

  return (
    <>
      {row.align === "start" ? (
        <SkeletonAvatar className="mt-auto size-8" />
      ) : null}
      <MessageSkeletonBubble row={row} />
    </>
  );
}

function MessageSkeletonBubble({ row }: { row: MessageSkeletonRow }) {
  return (
    <div className={getMessageSkeletonBubbleClassName(row)}>
      {row.kind === "proposal" ? (
        <ProposalMessageSkeleton />
      ) : (
        <TextMessageSkeleton row={row} />
      )}
    </div>
  );
}

function getMessageSkeletonBubbleClassName(row: MessageSkeletonRow) {
  return cn(
    "flex max-w-xs flex-col rounded-xl border px-1 py-1 shadow-sm backdrop-blur-md sm:max-w-lg md:max-w-xl",
    row.tone === "own"
      ? "rounded-br-none border-primary/15 bg-primary-soft"
      : "rounded-bl-none border-border/60 bg-card/75",
    row.kind === "proposal" && "w-full",
  );
}

function ProposalMessageSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton shape="circle" className="size-8" tone="amber" />
        <SkeletonText
          className="min-w-0 flex-1 gap-1.5"
          lineClassName="max-w-full"
          lines={2}
          size="sm"
          widths={["w-28", "w-36"]}
        />
      </div>
      <Skeleton shape="pill" className="h-7 w-16 shrink-0" />
    </div>
  );
}

function TextMessageSkeleton({ row }: { row: MessageSkeletonRow }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 px-2 py-1.5">
      <SkeletonText
        className="gap-2"
        lineClassName="max-w-full"
        lines={row.lines}
        widths={row.widths ?? ["w-80", "w-56"]}
      />
      <MessageMetaSkeleton row={row} />
    </div>
  );
}

function MessageMetaSkeleton({ row }: { row: MessageSkeletonRow }) {
  return (
    <div
      className={cn(
        "flex min-h-5 items-center justify-end gap-1 px-0 pb-0.5",
        row.tone === "own" ? "ml-auto" : "mr-auto",
      )}
    >
      <Skeleton className="h-2 w-9" />
      {row.tone === "own" ? (
        <Skeleton shape="circle" className="size-2.5" />
      ) : null}
    </div>
  );
}
