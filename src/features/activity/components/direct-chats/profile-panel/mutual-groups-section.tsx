import { Users } from "lucide-react";

interface MutualGroup {
  id: string;
  name: string;
  avatar: string;
}

interface MutualGroupsSectionProps {
  groups: MutualGroup[];
  isMobile?: boolean;
}

export function MutualGroupsSection({
  groups,
  isMobile = false,
}: MutualGroupsSectionProps) {
  if (!groups || groups.length === 0) return null;

  return (
    <div className="p-4 border-b border-border">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {!isMobile && <Users size={12} className="inline mr-1.5" />}
        Mutual Groups ({groups.length})
      </h4>

      {isMobile ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {groups.map((group) => (
            <button
              key={group.id}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-18"
            >
              <img
                src={group.avatar}
                alt={group.name}
                className="w-12 h-12 rounded-xl object-cover bg-muted"
              />
              <span className="text-xs text-foreground truncate max-w-16">
                {group.name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <img
                src={group.avatar}
                alt={group.name}
                className="w-10 h-10 rounded-xl object-cover bg-muted"
              />
              <span className="text-sm font-medium text-foreground truncate">
                {group.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
