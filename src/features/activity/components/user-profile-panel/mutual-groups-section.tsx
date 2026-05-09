import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface MutualGroup {
  id: string;
  name: string;
  avatar: string | null;
}

interface MutualGroupsSectionProps {
  groups: MutualGroup[];
}

export function MutualGroupsSection({ groups }: MutualGroupsSectionProps) {
  if (!groups.length) return null;

  return (
    <div className="border-border/40 border-b px-6 py-6">
      <h4 className="mb-4 px-1 font-semibold text-slate-muted text-xs uppercase tracking-widest">
        Mutual Groups ({groups.length})
      </h4>

      <div className="grid grid-cols-1 gap-3">
        {groups.map((group) => (
          <Button
            key={group.id}
            type="button"
            variant="ghost"
            className={cn(
              "h-auto w-full justify-start gap-4 rounded-xl p-3 transition-all duration-300",
              "group border border-border bg-card text-left shadow-sm hover:border-forge-teal/30 hover:shadow-md",
            )}
          >
            <div className="relative shrink-0">
              <Avatar
                src={group.avatar}
                name={group.name}
                className="size-11 bg-canvas shadow-xs ring-2 ring-card transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink text-sm transition-colors group-hover:text-forge-teal">
                {group.name}
              </span>
              <p className="mt-0.5 font-semibold text-slate-muted text-xs uppercase tracking-wider opacity-80">
                Peer Group
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
