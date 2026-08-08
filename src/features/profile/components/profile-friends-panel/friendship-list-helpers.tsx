import { Users } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";

export function FriendsListEmptyState({
  description,
}: {
  description: string;
}) {
  return (
    <EmptyState icon={Users} title="No friends yet" description={description} />
  );
}
