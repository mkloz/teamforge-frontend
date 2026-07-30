import { ShieldCheck } from "lucide-react";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Notice } from "@/shared/components/ui/notice";

interface BlockedUsersErrorStateProps {
  message: string;
}

export function BlockedUsersErrorState({
  message,
}: BlockedUsersErrorStateProps) {
  return (
    <Notice role="alert" tone="danger" size="md">
      {message}
    </Notice>
  );
}

export function BlockedUsersEmptyState() {
  return (
    <GroupedMenuList aria-label="Blocked people">
      <GroupedMenuItem>
        <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
          <IconTile icon={ShieldCheck} shape="circle" size="lg" tone="teal" />
          <div className="min-w-0">
            <p className="font-semibold text-ink text-sm">No blocked people</p>
            <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
              People you block will appear here.
            </p>
          </div>
        </div>
      </GroupedMenuItem>
    </GroupedMenuList>
  );
}
