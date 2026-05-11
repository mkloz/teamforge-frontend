import type { ReactNode } from "react";
import type { ErrorStateVisualBaseProps } from "./types";

type ErrorStateSvgProps = {
  children: ReactNode;
} & ErrorStateVisualBaseProps;

export function ErrorStateSvg({
  title,
  className,
  children,
  ...props
}: ErrorStateSvgProps) {
  return (
    <svg
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
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
