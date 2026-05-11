import type { ReactNode } from "react";
import { emptyVisualStroke } from "./tokens";
import type { EmptyStateVisualBaseProps } from "./types";

type EmptyStateSvgProps = {
  children: ReactNode;
} & EmptyStateVisualBaseProps;

export function EmptyStateSvg({
  title,
  className,
  strokeWidth = 3.25,
  children,
  ...props
}: EmptyStateSvgProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      stroke={emptyVisualStroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        "block h-auto w-40 max-w-full text-foreground",
        className,
      ].join(" ")}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
