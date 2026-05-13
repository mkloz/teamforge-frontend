import { memo } from "react";

import { AvatarStatus } from "@/shared/components/common/avatar";

export const StatusIndicator = memo(
  ({
    status,
    isCompact = false,
  }: {
    status: "ONLINE" | "AWAY" | "OFFLINE";
    isCompact?: boolean;
  }) => {
    return (
      <AvatarStatus
        status={status}
        sizeClassName={isCompact ? "size-2.5" : "size-3.5"}
      />
    );
  },
);
