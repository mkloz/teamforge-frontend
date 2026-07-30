import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleAlert,
  CircleCheck,
  Info,
  type LucideIcon,
  TriangleAlert,
} from "lucide-react";
import {
  Children,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
} from "react";

import { cn } from "@/shared/lib/utils";

const noticeVariants = cva(
  "flex min-w-0 flex-col items-start border font-medium leading-relaxed sm:flex-row",
  {
    variants: {
      tone: {
        danger: "border-destructive/20 bg-destructive/5 text-destructive",
        info: "border-primary/20 bg-primary/8 text-foreground",
        neutral: "border-border/70 bg-muted/20 text-foreground",
        success: "border-primary/20 bg-primary/8 text-foreground",
        warning: "border-accent/25 bg-accent/8 text-ink",
      },
      size: {
        xs: "gap-2 rounded-lg px-3 py-2 text-xs",
        sm: "gap-2 rounded-lg px-3 py-2 text-sm",
        md: "gap-2.5 rounded-lg px-3 py-3 text-sm",
        lg: "gap-3 rounded-xl p-4 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "info",
    },
  },
);

const noticeIconVariants = cva("mr-2 inline-flex shrink-0 align-text-bottom", {
  variants: {
    tone: {
      danger: "text-destructive",
      info: "text-primary",
      neutral: "text-slate-muted",
      success: "text-primary",
      warning: "text-accent",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

export interface NoticeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noticeVariants> {
  action?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  icon?: ReactNode;
  iconClassName?: string;
  statusIcon?: boolean;
}

export function Notice({
  action,
  children,
  className,
  contentClassName,
  icon,
  iconClassName,
  size,
  statusIcon = false,
  tone,
  ...props
}: NoticeProps) {
  const resolvedIcon =
    icon !== undefined
      ? icon
      : statusIcon
        ? renderStatusIcon(tone ?? "info")
        : null;

  return (
    <div className={cn(noticeVariants({ size, tone }), className)} {...props}>
      <div className={cn("min-w-0 flex-1", contentClassName)}>
        {resolvedIcon ? (
          <span className={cn(noticeIconVariants({ tone }), iconClassName)}>
            {resolvedIcon}
          </span>
        ) : null}
        {resolvedIcon ? renderInlineNoticeChildren(children) : children}
      </div>
      {action ? (
        <div className="w-full shrink-0 self-start sm:w-auto sm:self-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}

const STATUS_ICONS: Record<NonNullable<NoticeProps["tone"]>, LucideIcon> = {
  danger: CircleAlert,
  info: Info,
  neutral: Info,
  success: CircleCheck,
  warning: TriangleAlert,
};

function renderStatusIcon(tone: NonNullable<NoticeProps["tone"]>) {
  const StatusIcon = STATUS_ICONS[tone];

  return <StatusIcon aria-hidden="true" className="size-4" />;
}

function renderInlineNoticeChildren(children: ReactNode) {
  return Children.map(children, (child) => {
    if (!isValidElement<{ className?: string }>(child) || child.type !== "p") {
      return child;
    }

    return cloneElement(child, {
      className: cn("inline", child.props.className),
    });
  });
}
