import { Clock3, Search } from "lucide-react";

export function SearchStarted({ activityTitle }: { activityTitle: string }) {
  return (
    <section className="flex flex-col items-center gap-5 py-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
        <Search className="size-6" aria-hidden="true" />
      </div>
      <div className="grid gap-2">
        <h3 className="font-bold text-foreground text-xl">
          Your request is active
        </h3>
        <p className="mx-auto max-w-md text-muted-foreground text-sm leading-relaxed">
          TeamForge saved an active request for
          {activityTitle.trim() ? ` ${activityTitle.trim()}` : " this activity"}
          . It will check the request again automatically. No group has formed
          yet. You can review or pause the request from Home.
        </p>
      </div>
      <p className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-muted-foreground text-xs">
        <Clock3 className="size-4" aria-hidden="true" />
        Home will show the last check and the next scheduled check.
      </p>
    </section>
  );
}
