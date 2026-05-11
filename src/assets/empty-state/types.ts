import type { ComponentPropsWithoutRef } from "react";

export type EmptyStateVisualBaseProps = {
  title?: string;
  strokeWidth?: number;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "name">;
