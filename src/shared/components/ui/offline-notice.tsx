import { WifiOff } from "lucide-react";

import { Notice, type NoticeProps } from "@/shared/components/ui/notice";

interface OfflineNoticeProps extends Omit<NoticeProps, "icon"> {
  iconSizeClassName?: string;
  withIcon?: boolean;
}

export function OfflineNotice({
  children,
  iconClassName,
  iconSizeClassName = "size-4",
  role = "status",
  tone = "warning",
  withIcon = true,
  ...props
}: OfflineNoticeProps) {
  return (
    <Notice
      role={role}
      tone={tone}
      icon={
        withIcon ? (
          <WifiOff aria-hidden="true" className={iconSizeClassName} />
        ) : undefined
      }
      iconClassName={iconClassName}
      {...props}
    >
      {children}
    </Notice>
  );
}
