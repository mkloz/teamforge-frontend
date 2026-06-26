import type { Visibility } from "@/features/forge/lib/forge-contract";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import { VISIBILITY_OPTIONS } from "./step3-group.constants";

interface PrivacySectionProps {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}

type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number];

export function PrivacySection({
  visibility,
  onVisibilityChange,
}: PrivacySectionProps) {
  return (
    <section className="flex flex-col gap-3 border-border/25 border-t pt-4">
      <div className="px-0.5">
        <p className="font-semibold text-foreground text-sm leading-tight">
          Visibility
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {VISIBILITY_OPTIONS.map((option) => (
          <VisibilityOptionButton
            key={option.value}
            active={visibility === option.value}
            option={option}
            onVisibilityChange={onVisibilityChange}
          />
        ))}
      </div>
    </section>
  );
}

function VisibilityOptionButton({
  active,
  option,
  onVisibilityChange,
}: {
  active: boolean;
  option: VisibilityOption;
  onVisibilityChange: PrivacySectionProps["onVisibilityChange"];
}) {
  const { value, label, description, Icon } = option;

  return (
    <Button
      type="button"
      variant="ghost"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={() => onVisibilityChange(value)}
      className={getVisibilityOptionClassName(active)}
      contentClassName="min-w-0 items-start justify-start gap-3 whitespace-normal sm:grid sm:w-full sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-0"
    >
      <IconTile
        icon={Icon}
        size="xs"
        tone={active ? "teal" : "neutral"}
        className={getVisibilityOptionIconClassName(active)}
      />
      <div className="min-w-0 flex-1 gap-1 sm:contents">
        <p className={getVisibilityOptionLabelClassName(active)}>{label}</p>
        <p className="min-w-0 text-pretty text-micro text-muted-foreground leading-snug sm:col-span-3 sm:col-start-1 sm:row-start-2 sm:pt-2">
          {description}
        </p>
      </div>
    </Button>
  );
}

function getVisibilityOptionClassName(active: boolean) {
  return cn(
    "group h-auto w-full min-w-0 items-start justify-start whitespace-normal rounded-lg border p-3 text-left transition-colors duration-200",
    active
      ? "border-forge-teal/55 bg-forge-teal/10 shadow-sm ring-1 ring-forge-teal/20"
      : "border-border/40 bg-card hover:border-forge-teal/30 hover:bg-forge-teal/5",
  );
}

function getVisibilityOptionIconClassName(active: boolean) {
  return cn(
    "sm:col-start-1 sm:row-start-1",
    active
      ? "bg-forge-teal text-white shadow-forge-teal/25 shadow-sm"
      : "bg-muted group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
  );
}

function getVisibilityOptionLabelClassName(active: boolean) {
  return cn(
    "min-w-0 text-pretty font-semibold text-sm leading-5 sm:col-start-2 sm:row-start-1 sm:self-center",
    active ? "text-forge-teal" : "text-foreground",
  );
}
