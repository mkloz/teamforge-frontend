import { Link } from "@tanstack/react-router";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

interface AccountFormFooterProps {
  isOnline: boolean;
  isSaving: boolean;
}

export function AccountFormFooter({
  isOnline,
  isSaving,
}: AccountFormFooterProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card p-3 sm:gap-4 sm:p-5">
      <div>
        <p className="font-semibold text-ink text-sm">Ready to update?</p>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Saved changes appear across your profile and group surfaces.
        </p>
      </div>

      <div className="responsive-action-grid grid w-full gap-3">
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
