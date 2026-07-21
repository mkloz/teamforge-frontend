import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";

import {
  DIAGNOSTIC_CHECK_COUNT,
  DIAGNOSTIC_ICON_TONES,
  DIAGNOSTIC_STATUS_TONES,
} from "./diagnostic-copy";
import type { DiagnosticAction, DiagnosticItem } from "./types";

interface PwaDiagnosticsGridProps {
  diagnostics: DiagnosticItem[];
}

export function PwaDiagnosticsGrid({ diagnostics }: PwaDiagnosticsGridProps) {
  return (
    <ul
      className="mt-8 grid bg-transparent sm:grid-cols-2 lg:grid-cols-4"
      data-diagnostic-count={DIAGNOSTIC_CHECK_COUNT}
    >
      {diagnostics.map((item, index) => (
        <DiagnosticRow
          index={index}
          item={item}
          key={item.label}
          total={diagnostics.length}
        />
      ))}
    </ul>
  );
}

function getDiagnosticCellBorderClasses(index: number, total: number) {
  const isBeforeLastSmRow = isBeforeLastGridRow(index, total, 2);
  const isBeforeLastLgRow = isBeforeLastGridRow(index, total, 4);

  return cn(
    getConditionalClass(index < total - 1, "border-b", "border-b-0"),
    getConditionalClass(
      isBeforeLastGridColumn(index, total, 2),
      "sm:border-r",
      "sm:border-r-0",
    ),
    getConditionalClass(isBeforeLastSmRow, "sm:border-b", "sm:border-b-0"),
    getConditionalClass(
      isBeforeLastGridColumn(index, total, 4),
      "lg:border-r",
      "lg:border-r-0",
    ),
    getConditionalClass(isBeforeLastLgRow, "lg:border-b", "lg:border-b-0"),
  );
}

function getConditionalClass(
  condition: boolean,
  activeClass: string,
  inactiveClass: string,
) {
  return condition ? activeClass : inactiveClass;
}

function isBeforeLastGridColumn(index: number, total: number, columns: number) {
  const rowStart = Math.floor(index / columns) * columns;
  const itemsInRow = Math.min(columns, total - rowStart);

  return index - rowStart < itemsInRow - 1;
}

function isBeforeLastGridRow(index: number, total: number, columns: number) {
  const lastRowItemCount = total % columns || columns;
  const lastRowStart = total - lastRowItemCount;

  return index < lastRowStart;
}

function DiagnosticRow({
  index,
  item,
  total,
}: {
  index: number;
  item: DiagnosticItem;
  total: number;
}) {
  const Icon = item.icon;

  return (
    <li
      className={cn(
        "min-w-0 border-border/70 bg-transparent p-4 transition-colors duration-200 hover:bg-canvas/50 sm:p-5 dark:border-slate-muted/25 hover:dark:bg-background/40",
        getDiagnosticCellBorderClasses(index, total),
      )}
    >
      <div className="flex items-start gap-3">
        <IconTile
          bordered
          icon={Icon}
          shape="circle"
          size="lg"
          tone={DIAGNOSTIC_ICON_TONES[item.tone]}
          iconClassName="size-4"
        />
        <div className="min-w-0">
          <p className="font-semibold text-ink text-sm">{item.label}</p>
          <StatusPill
            size="xs"
            tone={DIAGNOSTIC_STATUS_TONES[item.tone]}
            className="mt-1 max-w-full px-2 py-0.5 text-xs"
          >
            {item.value}
          </StatusPill>
        </div>
      </div>
      <p className="mt-3 text-pretty text-slate-muted text-sm leading-relaxed">
        {item.detail}
      </p>
      {item.action ? <DiagnosticActionButton action={item.action} /> : null}
    </li>
  );
}

function DiagnosticActionButton({ action }: { action: DiagnosticAction }) {
  const ActionIcon = action.icon;

  return (
    <Button
      className="mt-4 min-h-11 [@media(pointer:fine)]:min-h-10"
      disabled={action.disabled}
      loading={action.loading}
      onClick={action.onClick}
      size="sm"
      variant="outline"
    >
      {ActionIcon ? (
        <ActionIcon size={15} strokeWidth={2} aria-hidden="true" />
      ) : null}
      {action.label}
    </Button>
  );
}
