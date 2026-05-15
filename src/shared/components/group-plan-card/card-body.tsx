import { ArrowRight } from "lucide-react";

import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";

interface CardBodyProps {
  fitReason: string;
  title: string;
  variant?: GroupPlanCardVariant;
}

export function CardBody({
  fitReason,
  title,
  variant = "default",
}: CardBodyProps) {
  const isCompact = variant === "compact";

  return (
    <div className={cn("relative z-20", isCompact ? "mb-4" : "mb-3.5")}>
      <h3
        className={cn(
          "line-clamp-2 font-extrabold text-foreground leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary md:pr-6",
          isCompact ? "text-xl" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 max-w-136 font-medium text-muted-foreground leading-relaxed",
          isCompact ? "text-sm" : "text-sm",
        )}
      >
        {fitReason}
      </p>

      {!isCompact ? (
        <div className="absolute top-1 right-0 hidden -translate-x-4 text-muted-foreground opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100 md:block">
          <ArrowRight className="size-5" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
