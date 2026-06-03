import { cva, type VariantProps } from "class-variance-authority";
import {
  Children,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
} from "react";

import { cn } from "@/shared/lib/utils";

const noticeVariants = cva(
  "flex min-w-0 items-start border font-medium leading-relaxed",
  {
    variants: {
      tone: {
        danger: "border-destructive/20 bg-destructive/5 text-destructive",
        info: "border-forge-teal/20 bg-forge-teal/8 text-foreground",
        neutral: "border-border/70 bg-muted/20 text-foreground",
        success: "border-forge-teal/20 bg-forge-teal/8 text-foreground",
        warning: "border-spark-amber/25 bg-spark-amber/8 text-ink",
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
      info: "text-forge-teal",
      neutral: "text-slate-muted",
      success: "text-forge-teal",
      warning: "text-spark-amber",
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
}

export function Notice({
  action,
  children,
  className,
  contentClassName,
  icon,
  iconClassName,
  size,
  tone,
  ...props
}: NoticeProps) {
  return (
    <div className={cn(noticeVariants({ size, tone }), className)} {...props}>
      <div className={cn("min-w-0 flex-1", contentClassName)}>
        {icon ? (
          <span className={cn(noticeIconVariants({ tone }), iconClassName)}>
            {icon}
          </span>
        ) : null}
        {icon ? renderInlineNoticeChildren(children) : children}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
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
