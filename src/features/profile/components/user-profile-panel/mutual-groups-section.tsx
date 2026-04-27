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
  if (!groups || groups.length === 0) return null;

  return (
    <div className="px-6 py-6 border-b border-border/40">
      <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-4">
        Mutual Groups ({groups.length})
      </h4>

      <div className="grid grid-cols-1 gap-3">
        {groups.map((group) => (
          <button
            key={group.id}
            className={cn(
              "flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-300",
              "bg-card border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-forge-teal/30 hover:shadow-md group text-left",
            )}
          >
            <div className="relative shrink-0">
              <img
                src={group.avatar || ""}
                alt={group.name}
                className="w-11 h-11 rounded-full object-cover bg-canvas ring-2 ring-card shadow-xs transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-ink truncate group-hover:text-forge-teal transition-colors">
                {group.name}
              </span>
              <p className="text-[10px] font-semibold text-slate-muted uppercase tracking-wider opacity-80 mt-0.5">
                Peer Group
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
