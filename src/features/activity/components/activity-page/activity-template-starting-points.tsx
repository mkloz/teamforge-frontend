import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Coffee,
  Gamepad2,
  type LucideIcon,
  Palette,
  TreePine,
} from "lucide-react";
import { ACTIVITY_TEMPLATE_STARTING_POINTS } from "@/features/forge/public/canonical-activity-templates";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import { buildForgeTemplateLaunchNavigation } from "@/shared/navigation";
import type { PlanCategory } from "@/shared/schemas";

type ActivityTemplateStartingPointsVariant = "sidebar" | "stage";

const startingPointIconByCategory: Partial<Record<PlanCategory, LucideIcon>> = {
  ARTS: Palette,
  GAMING: Gamepad2,
  LEARNING: BookOpen,
  OUTDOORS: TreePine,
  SOCIAL: Coffee,
};

interface ActivityTemplateStartingPointsProps {
  variant: ActivityTemplateStartingPointsVariant;
}

export function ActivityTemplateStartingPoints({
  variant,
}: ActivityTemplateStartingPointsProps) {
  const isSidebar = variant === "sidebar";

  return (
    <section
      aria-labelledby={`activity-starting-points-${variant}`}
      className={cn(
        isSidebar
          ? "border-border border-t px-4 py-6 md:hidden"
          : "flex min-h-full flex-1 items-center overflow-y-auto px-8 py-12",
      )}
    >
      <div className={cn("w-full", !isSidebar && "mx-auto max-w-2xl")}>
        <p className="font-semibold text-muted-foreground text-xs">
          Start with a plan
        </p>
        <h2
          id={`activity-starting-points-${variant}`}
          className={cn(
            "mt-2 text-balance font-black text-foreground leading-tight",
            isSidebar ? "text-lg" : "text-2xl",
          )}
        >
          No shared conversations yet
        </h2>
        <p
          className={cn(
            "mt-2 max-w-xl text-pretty text-muted-foreground leading-relaxed",
            isSidebar ? "text-xs" : "text-sm",
          )}
        >
          Pick something familiar. You can change the details before TeamForge
          starts forming the group.
        </p>

        <div
          className={cn(
            "mt-5 grid",
            isSidebar ? "grid-cols-1" : "grid-cols-1 gap-x-8 sm:grid-cols-2",
          )}
        >
          {ACTIVITY_TEMPLATE_STARTING_POINTS.map((startingPoint) => {
            const Icon =
              startingPointIconByCategory[startingPoint.categoryId] ?? BookOpen;

            return (
              <Link
                key={startingPoint.templateId}
                {...buildForgeTemplateLaunchNavigation(
                  startingPoint.templateId,
                )}
                className="group flex min-w-0 items-start gap-3 border-border border-t py-4 text-left outline-none transition-colors hover:text-forge-teal focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <IconTile
                  icon={Icon}
                  size="sm"
                  tone="teal"
                  className="mt-0.5 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground text-sm leading-snug transition-colors group-hover:text-forge-teal">
                    {startingPoint.title}
                  </span>
                  <span className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                    {startingPoint.description}
                  </span>
                  <span className="mt-1.5 block font-medium text-muted-foreground text-xs">
                    {startingPoint.categoryLabel}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  size={16}
                  className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-forge-teal"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
