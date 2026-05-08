import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";

export function UserMenuProfileSummary() {
  const { data: currentUser } = useCurrentUserQuery();

  return (
    <section className="px-5 py-5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          src={currentUser?.avatar}
          name={currentUser?.name}
          className="size-12 border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm"
          fallbackClassName="bg-forge-teal/10 text-sm tracking-wide text-forge-teal"
          loading="eager"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-base text-foreground leading-tight">
            {currentUser?.name ?? "Account details syncing"}
          </p>
          <p className="mt-1 truncate font-medium text-muted-foreground text-sm">
            {currentUser?.email ?? "Your session is active"}
          </p>
        </div>
      </div>
    </section>
  );
}
