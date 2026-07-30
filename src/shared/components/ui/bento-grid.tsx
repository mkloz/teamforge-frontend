import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

export const COMPACT_BENTO_SLOTS = [
  "lead",
  "center-top",
  "right-rail",
  "center-bottom",
  "lower-left",
  "closing",
] as const;

export const EDITORIAL_BENTO_SLOTS = [
  "lead",
  "center-top",
  "upper-right",
  "right-rail",
  "lower-left",
  "lower-left-secondary",
  "lower-right",
  "center-bottom",
] as const;

export type CompactBentoSlot = (typeof COMPACT_BENTO_SLOTS)[number];
export type EditorialBentoSlot = (typeof EDITORIAL_BENTO_SLOTS)[number];

interface CompactBentoItemProps extends ComponentProps<"div"> {
  slot: CompactBentoSlot;
}

interface EditorialBentoItemProps extends ComponentProps<"div"> {
  slot: EditorialBentoSlot;
}

export function CompactBentoGrid({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative grid auto-rows-[2rem] grid-cols-2 gap-2.5 sm:auto-rows-[2.5rem] sm:grid-cols-8 sm:gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function CompactBentoItem({
  className,
  slot,
  ...props
}: CompactBentoItemProps) {
  return (
    <div
      className={cn("min-w-0", COMPACT_BENTO_SLOT_CLASSNAMES[slot], className)}
      {...props}
    />
  );
}

export function EditorialBentoGrid({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative grid auto-rows-[2.5rem] grid-cols-2 gap-2.5 px-1 sm:auto-rows-[3rem] sm:gap-3 sm:px-2 lg:grid-cols-12 lg:px-0",
        className,
      )}
      {...props}
    />
  );
}

export function EditorialBentoItem({
  className,
  slot,
  ...props
}: EditorialBentoItemProps) {
  return (
    <div
      className={cn(
        "min-w-0",
        EDITORIAL_BENTO_SLOT_CLASSNAMES[slot],
        className,
      )}
      {...props}
    />
  );
}

export function getCompactBentoSlot(index: number): CompactBentoSlot {
  return (
    COMPACT_BENTO_SLOTS[index % COMPACT_BENTO_SLOTS.length] ??
    COMPACT_BENTO_SLOTS[0]
  );
}

export function getEditorialBentoSlot(index: number): EditorialBentoSlot {
  return (
    EDITORIAL_BENTO_SLOTS[index % EDITORIAL_BENTO_SLOTS.length] ??
    EDITORIAL_BENTO_SLOTS[0]
  );
}

const COMPACT_BENTO_SLOT_CLASSNAMES: Record<CompactBentoSlot, string> = {
  lead: "col-span-2 row-span-5 sm:col-span-4 sm:row-span-4",
  "center-top":
    "col-span-1 col-start-1 row-span-4 row-start-6 sm:col-span-2 sm:col-start-5 sm:row-span-3 sm:row-start-1",
  "right-rail":
    "col-span-1 col-start-2 row-span-3 row-start-6 sm:col-span-2 sm:col-start-7 sm:row-span-7 sm:row-start-1",
  "center-bottom":
    "col-span-1 col-start-2 row-span-5 row-start-9 sm:col-span-2 sm:col-start-5 sm:row-span-4 sm:row-start-4",
  "lower-left":
    "col-span-1 col-start-1 row-span-4 row-start-10 sm:col-span-2 sm:col-start-1 sm:row-span-3 sm:row-start-5",
  closing:
    "col-span-2 col-start-1 row-span-4 row-start-14 sm:col-span-2 sm:col-start-3 sm:row-span-3 sm:row-start-5",
};

const EDITORIAL_BENTO_SLOT_CLASSNAMES: Record<EditorialBentoSlot, string> = {
  lead: "col-span-2 row-span-5 lg:col-span-4 lg:row-span-4",
  "center-top":
    "col-span-1 col-start-1 row-span-4 row-start-6 lg:col-span-3 lg:col-start-5 lg:row-span-4 lg:row-start-1",
  "upper-right":
    "col-span-1 col-start-2 row-span-3 row-start-6 lg:col-span-3 lg:col-start-8 lg:row-span-3 lg:row-start-1",
  "right-rail":
    "col-span-1 col-start-2 row-span-5 row-start-9 lg:col-span-2 lg:col-start-11 lg:row-span-7 lg:row-start-1",
  "lower-left":
    "col-span-1 col-start-1 row-span-3 row-start-10 lg:col-span-2 lg:col-start-1 lg:row-span-3 lg:row-start-5",
  "lower-left-secondary":
    "col-span-1 col-start-1 row-span-4 row-start-13 lg:col-span-2 lg:col-start-3 lg:row-span-3 lg:row-start-5",
  "lower-right":
    "col-span-1 col-start-2 row-span-3 row-start-14 lg:col-span-3 lg:col-start-8 lg:row-span-4 lg:row-start-4",
  "center-bottom":
    "col-span-2 col-start-1 row-span-4 row-start-17 lg:col-span-3 lg:col-start-5 lg:row-span-3 lg:row-start-5",
};
