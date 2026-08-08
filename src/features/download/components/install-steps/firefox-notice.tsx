import { Link } from "@tanstack/react-router";
import { DownloadPageLinkCopy } from "@/features/download/components/install-steps/download-page-link-copy-control";
import { DOWNLOAD_AUTH_RETURN_TO } from "@/features/download/download.constants";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

export function FirefoxNotice() {
  return (
    <div className="rounded-2xl border border-spark-amber/20 bg-spark-amber/5 px-6 py-8 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ink text-xl">
            Firefox doesn't support web app installation
          </h3>
          <p className="mt-2 max-w-lg text-pretty text-slate-muted leading-relaxed">
            Firefox doesn't yet support installing web apps as standalone
            applications. To install TeamForge on this computer, open this page
            in <strong className="text-ink">Google Chrome</strong> or{" "}
            <strong className="text-ink">Microsoft Edge</strong>, then follow
            the installation steps shown there.
          </p>

          <DownloadPageLinkCopy />

          <p className="mt-4 text-slate-muted text-sm">
            You can still use TeamForge in Firefox as a regular web page.{" "}
            <Link
              {...buildAuthRouteNavigation(
                "/auth/login",
                DOWNLOAD_AUTH_RETURN_TO,
              )}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Sign in here.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
