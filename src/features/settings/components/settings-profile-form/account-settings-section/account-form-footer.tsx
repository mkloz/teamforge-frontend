import { Link } from "@tanstack/react-router";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Button } from "@/shared/components/ui/button";

interface AccountFormFooterProps {
  isSaving: boolean;
}

export function AccountFormFooter({ isSaving }: AccountFormFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
      <p className="text-slate-muted text-sm">
        Changes show up across your profile and group surfaces.
      </p>

      <div className="responsive-action-grid grid w-full gap-3 md:max-w-92">
        <Button asChild variant="outline" className="min-w-0 px-3">
          <Link {...buildProfileNavigation()}>View profile</Link>
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="min-w-0 px-3"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
