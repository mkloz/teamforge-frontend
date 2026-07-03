import { type LucideIcon, Palette } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { SwatchStrip } from "./swatch-strip";

interface ThemeRecipeStripProps {
  appearanceLabel: string;
  appearanceIcon: LucideIcon;
  styleLabel: string;
  styleIcon: LucideIcon;
  colorLabel: string;
  colorSwatches: readonly string[];
}

export function ThemeRecipeStrip({
  appearanceLabel,
  appearanceIcon: AppearanceIcon,
  styleLabel,
  styleIcon: StyleIcon,
  colorLabel,
  colorSwatches,
}: ThemeRecipeStripProps) {
  return (
    <div className="border-border border-y">
      <div className="grid divide-y divide-border md:grid-cols-[1fr_1fr_1.15fr] md:divide-x md:divide-y-0">
        <RecipeItem
          icon={AppearanceIcon}
          eyebrow="Mode"
          label={appearanceLabel}
        />
        <RecipeItem icon={StyleIcon} eyebrow="Style" label={styleLabel} />
        <div className="flex min-w-0 items-center gap-3 py-3 md:px-5">
          <IconTile
            icon={Palette}
            tone="neutral"
            size="lg"
            className="size-9 bg-input text-slate-muted"
            iconClassName="size-4"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-muted text-xs">Color</p>
            <div className="mt-1 flex min-w-0 items-center gap-3">
              <p className="truncate font-black text-ink text-sm">
                {colorLabel}
              </p>
              <SwatchStrip swatches={colorSwatches} className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecipeItemProps {
  icon: LucideIcon;
  eyebrow: string;
  label: string;
}

function RecipeItem({ icon: Icon, eyebrow, label }: RecipeItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-3 md:px-5 first:md:pl-0">
      <IconTile
        icon={Icon}
        tone="neutral"
        size="lg"
        className="size-9 bg-input text-slate-muted"
        iconClassName="size-4"
      />
      <div className="min-w-0">
        <p className="font-semibold text-slate-muted text-xs">{eyebrow}</p>
        <p className="mt-1 truncate font-black text-ink text-sm">{label}</p>
      </div>
    </div>
  );
}
