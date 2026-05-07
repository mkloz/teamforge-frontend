import { Settings } from "lucide-react";

import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type UserMenuTrigger = "avatar" | "settings";

interface UserMenuTriggerButtonProps {
  trigger: UserMenuTrigger;
}

export function UserMenuTriggerButton({ trigger }: UserMenuTriggerButtonProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSettingsTrigger = trigger === "settings";

  return (
    <Button
      variant={isSettingsTrigger ? "surface" : "ghost"}
      size="icon"
      className={cn("shrink-0 rounded-full", isSettingsTrigger && "size-10")}
      aria-label="Open account drawer"
    >
      {isSettingsTrigger ? (
        <Settings size={18} aria-hidden="true" />
      ) : (
        <Avatar
          src={currentUser?.avatar}
          name={currentUser?.name}
          className="h-8 w-8 border border-primary/20 bg-primary/10 text-primary"
          fallbackClassName="bg-primary/10 text-[11px] tracking-wide text-primary"
          loading="eager"
        />
      )}
    </Button>
  );
}
