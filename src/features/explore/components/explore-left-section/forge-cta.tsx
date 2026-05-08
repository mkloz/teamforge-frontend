import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";

export function ForgeCTA() {
  return (
    <div className="group/card border-border/50 border-t px-1 pt-4">
      <div className="relative z-10 space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-black text-base text-foreground leading-tight tracking-tight">
            Nothing quite right?
          </h3>
          <p className="font-medium text-muted-foreground text-xs leading-relaxed">
            Start the opening yourself and let TeamForge fill the remaining
            spots around the plan.
          </p>
        </div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button asChild size="md" className="w-full font-bold">
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
