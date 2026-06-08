import type { ComponentPropsWithoutRef } from "react";

export type ErrorStateVisualBaseProps = {
  title?: string;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "name">;
