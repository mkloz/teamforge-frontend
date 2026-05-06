export function getTagPillSlotClasses({
  selected,
  hasRejectAction,
}: {
  selected: boolean;
  hasRejectAction: boolean;
}) {
  return {
    left: selected ? "w-3.5 sm:w-4" : "w-1.5 sm:w-2",
    right: selected ? "w-0" : hasRejectAction ? "w-3.5 sm:w-4" : "w-1.5 sm:w-2",
  };
}
