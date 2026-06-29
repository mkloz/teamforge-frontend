import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { buildForgeLaunchNavigation } from "@/shared/navigation/forge-navigation";

export function ForgeCTA() {
  return (
    <div className="group/card border-border/50 border-t px-1 pt-4">
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-black text-base text-foreground leading-tight tracking-tight">
            Nothing quite right?
          </h3>
          <p className="font-medium text-muted-foreground text-xs leading-relaxed">
            Start the opening yourself and let TeamForge fill the remaining
            spots around the plan.
          </p>
        </div>

        <div className="transition-transform duration-150 group-hover/card:-translate-y-0.5">
          <Button asChild size="md" className="w-full">
            <Link {...buildForgeLaunchNavigation()}>
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Forge my group
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
