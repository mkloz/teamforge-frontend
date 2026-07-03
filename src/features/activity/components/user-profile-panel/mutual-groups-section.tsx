import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";

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
    <section className="border-border/70 border-b px-5 py-6">
      <h4 className="font-bold text-slate-muted text-xs">
        Shared groups ({groups.length})
      </h4>

      <div className="mt-3 flex flex-col divide-y divide-border/70 border-border/70 border-y">
        {groups.map((group) => (
          <Button
            asChild
            key={group.id}
            variant="link"
            className="group h-auto w-full justify-start rounded-lg px-0 py-2 text-left text-ink! hover:enabled:no-underline"
          >
            <Link
              {...buildGroupPlanDetailNavigation(group.id, {
                source: "activity",
              })}
              aria-label={`Open ${group.name}`}
            >
              <Avatar
                src={group.avatar}
                name={group.name}
                className="size-9 bg-canvas ring-1 ring-border/40"
              />

              <span className="min-w-0 flex-1 truncate font-bold text-sm transition-colors group-hover:text-forge-teal">
                {group.name}
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-slate-muted transition-colors group-hover:text-forge-teal" />
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
