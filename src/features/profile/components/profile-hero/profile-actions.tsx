import { Link } from "@tanstack/react-router";
import { Settings, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";

export function ProfileActions() {
  return (
    <div className="grid w-full grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3">
      <Button asChild className="w-full shrink-0 sm:w-auto">
        <Link aria-label="Edit profile" {...buildSettingsNavigation("account")}>
          <Settings className="size-4 shrink-0 sm:size-5" />
          <span>Edit Profile</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link
          aria-label="Update matching"
          {...buildSettingsNavigation("matching")}
        >
          <SlidersHorizontal className="size-4 shrink-0 sm:size-5" />
          <span className="sm:hidden">Matching</span>
          <span className="hidden sm:inline">Update Matching</span>
        </Link>
      </Button>
    </div>
  );
}
