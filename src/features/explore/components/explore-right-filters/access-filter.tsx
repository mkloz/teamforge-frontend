import { cn } from "@/shared/lib/utils";
import { Handshake, Unlock, Users } from "lucide-react";
import { useExploreStore } from "../store/use-explore-store";

export function AccessFilter() {
  const { access, setAccess } = useExploreStore();

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold text-foreground tracking-tight pl-1">
        Access Mode
      </h4>
      <div className="flex p-1 bg-muted/20 rounded-xl border border-border/40 relative gap-1">
        {(
          [
            { id: "All", label: "Any", icon: Users },
            { id: "Open", label: "Open", icon: Unlock },
            { id: "Request", label: "Req", icon: Handshake },
          ] as const
        ).map((opt) => {
          const active = access === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setAccess(opt.id)}
              className={cn(
                "relative z-10 flex-1 flex flex-row items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/20 scale-100"
                  : "text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground active:scale-95",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 transition-colors shrink-0",
                  active ? "text-primary" : "opacity-70",
                )}
              />
              <span className="tracking-tight whitespace-nowrap">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
