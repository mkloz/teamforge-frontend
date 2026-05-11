import { Settings } from "lucide-react";
import type { ComponentPropsWithoutRef, Ref } from "react";

import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type UserMenuTrigger = "avatar" | "settings";

interface UserMenuTriggerButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  ref?: Ref<HTMLButtonElement>;
  trigger: UserMenuTrigger;
}

export function UserMenuTriggerButton({
  className,
  ref,
  trigger,
  ...props
}: UserMenuTriggerButtonProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSettingsTrigger = trigger === "settings";

  return (
    <Button
      ref={ref}
      variant={isSettingsTrigger ? "inverseGhost" : "ghost"}
      size="icon"
      className={cn(
        "shrink-0 rounded-full",
        isSettingsTrigger &&
          "size-10 border-white/25 bg-white/15 text-white shadow-sm focus-visible:ring-white active:enabled:bg-white/85 active:enabled:text-forge-teal hover:enabled:border-white/65 hover:enabled:bg-white hover:enabled:text-forge-teal data-[state=open]:bg-white data-[state=open]:text-forge-teal",
        className,
      )}
      aria-label="Open account drawer"
      {...props}
    >
      {isSettingsTrigger ? (
        <Settings size={18} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Avatar
          src={currentUser?.avatar}
          name={currentUser?.name}
          className="size-8 border border-primary/20 bg-primary/10 text-primary"
          fallbackClassName="bg-primary/10 text-micro tracking-wide text-primary"
          loading="eager"
        />
      )}
    </Button>
  );
}
