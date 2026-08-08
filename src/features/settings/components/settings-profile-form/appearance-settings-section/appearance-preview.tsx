import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  ThemeStyle,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import { cn } from "@/shared/lib/utils";

import type { ThemeSelectionState } from "./appearance-options";

interface AppearancePreviewProps {
  isDark: boolean;
  isResetDisabled: boolean;
  isResetting: boolean;
  isSaving: boolean;
  onReset: () => void;
  selection: ThemeSelectionState;
}

export function AppearancePreview({
  isDark,
  isResetDisabled,
  isResetting,
  isSaving,
  onReset,
  selection,
}: AppearancePreviewProps) {
  const swatches =
    selection.selectedColorOption.swatches[isDark ? "dark" : "light"];

  return (
    <section className="overflow-hidden rounded-2xl bg-card">
      <div className="flex items-start justify-between gap-3 p-3 sm:gap-4 sm:px-5 sm:pt-5 sm:pb-4">
        <div className="min-w-0">
          <h3 className="font-bold text-base text-ink">Live preview</h3>
          <p className="mt-1 truncate text-slate-muted text-sm">
            {selection.selectedAppearanceOption.label}
            <span aria-hidden="true"> · </span>
            {selection.selectedStyleOption.label}
            <span aria-hidden="true"> · </span>
            {selection.selectedColorOption.label}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={isResetDisabled}
          loading={isResetting}
          onClick={onReset}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div
          className={cn(
            "overflow-hidden bg-background/75 p-2 sm:p-3",
            getPreviewFrameClassName(selection.themeStyle),
          )}
        >
          <div className="grid min-h-40 grid-cols-[2.75rem_minmax(0,1fr)] overflow-hidden rounded-xl bg-canvas">
            <PreviewNavigation swatches={swatches} />
            <PreviewContent
              isSaving={isSaving}
              style={selection.themeStyle}
              swatches={swatches}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewNavigation({ swatches }: { swatches: readonly string[] }) {
  return (
    <div className="flex flex-col items-center gap-2 border-border/60 border-r bg-background/65 px-2 py-3">
      <span
        className={cn("mb-2 size-5 rounded-md", swatches[3] ?? "bg-primary")}
      />
      <span className="h-5 w-full rounded-md bg-primary/18" />
      <span className="h-5 w-full rounded-md bg-muted/65" />
      <span className="h-5 w-full rounded-md bg-muted/45" />
      <span className="mt-auto size-5 rounded-full bg-muted" />
    </div>
  );
}

function PreviewContent({
  isSaving,
  style,
  swatches,
}: {
  isSaving: boolean;
  style: ThemeStyleValue;
  swatches: readonly string[];
}) {
  const surfaceClassName = getPreviewSurfaceClassName(style);

  return (
    <div className="min-w-0 p-2 sm:p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="h-2.5 w-24 rounded-full bg-ink/85" />
          <div className="mt-2 h-2 w-36 max-w-full rounded-full bg-slate-muted/30" />
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-slate-muted text-xs">
          <span
            className={cn(
              "size-1.5 rounded-full",
              isSaving ? "animate-pulse bg-accent" : "bg-primary",
            )}
          />
          {isSaving ? "Updating" : "Preview"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-2">
        <div className={cn("min-w-0 p-2 sm:p-3", surfaceClassName)}>
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-primary/22" />
            <div className="min-w-0 flex-1">
              <div className="h-2 w-20 max-w-full rounded-full bg-ink/75" />
              <div className="mt-1.5 h-1.5 w-14 max-w-full rounded-full bg-slate-muted/30" />
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted" />
          <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-muted/70" />
        </div>

        <div
          className={cn("flex min-w-0 flex-col p-2 sm:p-3", surfaceClassName)}
        >
          <div className="flex h-6 overflow-hidden rounded-md">
            {swatches.map((swatch) => (
              <span
                key={swatch}
                className={cn("min-w-0 flex-1", swatch)}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="mt-auto h-6 rounded-md bg-primary" />
        </div>
      </div>
    </div>
  );
}

function getPreviewFrameClassName(style: ThemeStyleValue) {
  if (style === ThemeStyle.POSTER) {
    return "rounded-lg border-2 border-ink/70 shadow-[3px_3px_0_color-mix(in_srgb,var(--color-ink)_35%,transparent)]";
  }

  if (style === ThemeStyle.GLASS) {
    return "rounded-xl bg-surface-inset";
  }

  return style === ThemeStyle.INK
    ? "rounded-lg bg-muted/65"
    : "rounded-2xl bg-background/75";
}

function getPreviewSurfaceClassName(style: ThemeStyleValue) {
  if (style === ThemeStyle.POSTER) {
    return "rounded-md border-2 border-ink/55 bg-card";
  }

  if (style === ThemeStyle.GLASS) {
    return "rounded-lg bg-surface-inset";
  }

  return style === ThemeStyle.INK
    ? "rounded-lg bg-muted/80"
    : "rounded-xl bg-card";
}
