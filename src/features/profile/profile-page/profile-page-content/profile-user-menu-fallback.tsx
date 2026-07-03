import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProfileUserMenuFallback() {
  return (
    <Skeleton
      shape="circle"
      className="size-10 border border-white/15 bg-white/8"
    />
  );
}
