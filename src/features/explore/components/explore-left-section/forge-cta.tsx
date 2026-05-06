import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function ForgeCTA() {
  return (
    <div className="group/card border-t border-border/50 px-1 pt-5">
      <div className="relative z-10 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-black leading-tight tracking-tight text-foreground">
            Nothing quite right?
          </h3>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            Start the opening yourself and let TeamForge fill the remaining
            spots around the plan.
          </p>
        </div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button asChild size="lg" className="w-full font-bold">
            <Link {...buildForgeLaunchNavigation()}>
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Forge my group
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
