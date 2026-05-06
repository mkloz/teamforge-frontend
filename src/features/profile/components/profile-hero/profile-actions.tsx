import { Button } from "@/shared/components/ui/button";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Link } from "@tanstack/react-router";
import { Settings, SlidersHorizontal } from "lucide-react";

export function ProfileActions() {
  return (
    <div className="grid w-full grid-cols-1 items-center gap-2 pr-0 min-[390px]:grid-cols-2 sm:flex sm:w-auto sm:flex-row sm:gap-3">
      <Button asChild className="min-h-11 w-full shrink-0 sm:w-auto">
        <Link {...buildSettingsNavigation("account")}>
          <Settings className="shrink-0" />
          <span>Edit Profile</span>
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className="min-h-11 w-full border-2 sm:w-auto"
      >
        <Link {...buildSettingsNavigation("matching")}>
          <SlidersHorizontal className="shrink-0" />
          <span>Update Matching</span>
        </Link>
      </Button>
    </div>
  );
}
