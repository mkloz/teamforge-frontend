import { Users } from "lucide-react";

export function FriendsListEmptyState({
  description,
}: {
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed py-16 text-center">
      <div className="rounded-full bg-muted/50 p-3">
        <Users className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-bold text-foreground">No friends yet</h3>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  );
}
