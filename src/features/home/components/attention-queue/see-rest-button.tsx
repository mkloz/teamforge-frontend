import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { buildHomeNavigation } from "@/features/home/lib/home-route";
import { Button } from "@/shared/components/ui/button";

interface SeeRestButtonProps {
  hiddenItemCount: number;
}

export function SeeRestButton({ hiddenItemCount }: SeeRestButtonProps) {
  return (
    <li className="px-1 py-2 sm:px-3">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-full justify-between hover:enabled:text-forge-teal"
      >
        <Link
          {...buildHomeNavigation({ notifications: true })}
          aria-label={`View ${hiddenItemCount} more attention ${
            hiddenItemCount === 1 ? "item" : "items"
          }`}
        >
          View {hiddenItemCount} more
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </li>
  );
}
