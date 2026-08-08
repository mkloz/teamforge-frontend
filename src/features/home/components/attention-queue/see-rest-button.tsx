import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { buildHomeNavigation } from "@/shared/navigation/home-navigation";

interface SeeRestButtonProps {
  hiddenItemCount: number;
}

export function SeeRestButton({ hiddenItemCount }: SeeRestButtonProps) {
  return (
    <li className="py-1 lg:col-span-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-auto px-2 hover:enabled:text-foreground"
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
