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
    <div className="border-b border-border/40 px-6 py-6">
      <h4 className="mb-4 px-1 text-xs font-semibold tracking-widest text-slate-muted uppercase">
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
              "group border border-border bg-card text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-forge-teal/30 hover:shadow-md",
            )}
          >
            <div className="relative shrink-0">
              <Avatar
                src={group.avatar}
                name={group.name}
                className="h-11 w-11 bg-canvas shadow-xs ring-2 ring-card transition-[scale,transform] duration-500 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink transition-colors group-hover:text-forge-teal">
                {group.name}
              </span>
              <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-slate-muted uppercase opacity-80">
                Peer Group
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
