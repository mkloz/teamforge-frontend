import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Link } from "@tanstack/react-router";
import { Settings, SlidersHorizontal } from "lucide-react";

export function ProfileActions({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 pr-0 w-full sm:w-auto",
        className,
      )}
    >
      <Button asChild className="flex-1 sm:w-auto shrink-0">
        <Link {...buildSettingsNavigation("account")}>
          <Settings />
          <span>Edit Profile</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full sm:w-auto border-2">
        <Link {...buildSettingsNavigation("matching")}>
          <SlidersHorizontal />
          <span>Update Matching</span>
        </Link>
      </Button>
    </div>
  );
}
