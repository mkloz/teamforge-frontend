import { DownloadPageLinkCopy } from "@/features/download/components/install-steps/download-page-link-copy-control";
import { getIosBrowserName } from "@/features/download/hooks/use-download-page";

const OPEN_IN_SAFARI_STEPS = [
  {
    title: "Copy the link above",
    body: "Tap 'Copy link' to copy this page's address to your clipboard.",
  },
  {
    title: "Open Safari",
    body: "Find Safari on your home screen (the compass icon) and tap to open it.",
  },
  {
    title: "Paste the link and navigate",
    body: "Tap Safari's address bar at the top, paste the link, and tap Go. You'll arrive at this page inside Safari.",
  },
  {
    title: "Follow the Safari installation steps",
    body: "Once you're here in Safari, tap the Share button (□↑) at the bottom of the screen and choose 'Add to Home Screen'.",
  },
] as const;

export function IosNonSafariNotice() {
  const browserName = getIosBrowserName();

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-spark-amber/20 bg-spark-amber/5 px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-ink text-xl">
              {browserName} can't install web apps on iPhone
            </h3>
            <p className="mt-2 max-w-lg text-pretty text-slate-muted leading-relaxed">
              On iPhone and iPad, only{" "}
              <strong className="text-ink">Safari</strong> supports Add to Home
              Screen. You need to open this page in Safari to install TeamForge.
            </p>

            <DownloadPageLinkCopy />
          </div>
        </div>
      </div>

      <ol
        className="divide-y divide-border/60"
        aria-label="How to open in Safari"
      >
        {OPEN_IN_SAFARI_STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex items-start gap-6 py-7 sm:gap-10"
          >
            <span className="shrink-0 select-none font-extrabold text-4xl text-spark-amber/30 tabular-nums leading-none sm:text-6xl">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-ink text-lg">{step.title}</h3>
              <p className="mt-1.5 max-w-xl text-pretty text-slate-muted leading-relaxed">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
