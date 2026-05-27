import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { buildHomeNavigation } from "@/features/home/lib/home-route";
import { Button } from "@/shared/components/ui/button";

interface SeeRestButtonProps {
  hiddenItemCount: number;
}

export function SeeRestButton({ hiddenItemCount }: SeeRestButtonProps) {
  return (
    <li className="px-1 py-3 sm:px-3">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="justify-start hover:enabled:text-forge-teal"
      >
        <Link
          {...buildHomeNavigation({ notifications: true })}
          aria-label={`See ${hiddenItemCount} more attention ${
            hiddenItemCount === 1 ? "item" : "items"
          }`}
        >
          See the rest
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </li>
  );
}
