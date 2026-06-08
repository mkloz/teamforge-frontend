import { Link } from "@tanstack/react-router";
import { ExternalLink, Save } from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Button } from "@/shared/components/ui/button";

interface AccountFormFooterProps {
  isOnline: boolean;
  isSaving: boolean;
}

export function AccountFormFooter({
  isOnline,
  isSaving,
}: AccountFormFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
      <p className="text-slate-muted text-sm">
        Changes show up across your profile and group surfaces.
      </p>

      <div className="responsive-action-grid grid w-full gap-3 md:max-w-92">
        <Button asChild variant="outline" size="compact" className="min-w-0">
          <Link {...buildProfileNavigation()}>
            <ExternalLink className="size-4" aria-hidden="true" />
            View profile
          </Link>
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="compact"
          className="min-w-0"
          disabled={isSaving || !isOnline}
        >
          <Save className="size-4" aria-hidden="true" />
          {isSaving
            ? "Saving..."
            : isOnline
              ? "Save changes"
              : "Reconnect to save"}
        </Button>
      </div>
    </div>
  );
}
