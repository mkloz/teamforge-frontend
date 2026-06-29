import { Link } from "@tanstack/react-router";
import type { GroupPlanActionDescriptor } from "@/features/group-plan-detail/lib/group-plan-action-state";
import { Button, type ButtonV2Props } from "@/shared/components/ui/button";

interface GroupPlanActionButtonProps {
  action: GroupPlanActionDescriptor;
  ariaLabel?: string;
  className?: string;
  label?: string;
  showIcon?: boolean;
  size?: ButtonV2Props["size"];
  variant?: ButtonV2Props["variant"];
}

export function GroupPlanActionButton({
  action,
  ariaLabel,
  className,
  label,
  showIcon = true,
  size,
  variant = "primary",
}: GroupPlanActionButtonProps) {
  const Icon = action.icon;
  const actionLabel = label ?? action.label;

  if (action.kind === "link" && action.href) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link {...action.href}>
          {showIcon ? <Icon className="size-4" aria-hidden="true" /> : null}
          {actionLabel}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      loading={action.loading}
      disabled={action.disabled}
      aria-label={ariaLabel}
      title={action.title}
      onClick={action.onClick}
    >
      {showIcon ? <Icon className="size-4" aria-hidden="true" /> : null}
      {actionLabel}
    </Button>
  );
}
