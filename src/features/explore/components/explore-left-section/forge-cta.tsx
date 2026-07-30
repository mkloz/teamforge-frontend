import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { buildForgeLaunchNavigation } from "@/shared/navigation/forge-navigation";

export function ForgeCTA() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <h3 className="font-black text-2xl text-foreground leading-tight tracking-tight">
          Nothing fits yet?
        </h3>
        <p className="mt-1.5 font-medium text-muted-foreground text-sm leading-relaxed">
          Start with your own idea, then let TeamForge help find the people.
        </p>
      </div>

      <Button asChild size="md" className="w-full shrink-0 sm:w-auto">
        <Link {...buildForgeLaunchNavigation()}>
          <Plus className="size-4" />
          Forge a plan
        </Link>
      </Button>
    </div>
  );
}
