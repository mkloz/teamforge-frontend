import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { Image } from "@/shared/components/common/image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";

function getAvatarInitials(name?: string | null) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "TF";
}

interface AvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onError" | "onLoad"> {
  src?: string | null;
  name?: string | null;
  alt?: string;
  fallback?: ReactNode;
  imageClassName?: string;
  fallbackClassName?: string;
  imageSize?: number;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  shape?: "circle" | "rounded";
}

interface AvatarStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: OnlineStatus;
  borderClassName?: string;
  sizeClassName?: string;
}

const avatarStatusColors: Record<OnlineStatus, string> = {
  ONLINE: "bg-forge-teal",
  AWAY: "bg-spark-amber",
  OFFLINE: "bg-slate-muted/40",
};

export function AvatarStatus({
  status,
  borderClassName = "border-background",
  className,
  sizeClassName = "size-3",
  ...props
}: AvatarStatusProps) {
  return (
    <span
      className={cn(
        "absolute right-[14.64466094%] bottom-[14.64466094%] z-20 translate-x-1/2 translate-y-1/2 rounded-full border-2 shadow-sm",
        sizeClassName,
        borderClassName,
        avatarStatusColors[status],
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({
  src,
  name,
  alt,
  fallback,
  className,
  imageClassName,
  fallbackClassName,
  imageSize,
  loading = "lazy",
  shape = "circle",
  children,
  ...props
}: AvatarProps) {
  const initials = fallback ?? getAvatarInitials(name);
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const imageSrc = imageSize ? getSizedImageUrl(src, imageSize) : src;
  const fallbackNode = (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-forge-teal/10 font-black text-[0.72em] text-forge-teal leading-none",
        fallbackClassName,
      )}
    >
      {initials}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-muted",
        radiusClass,
        className,
      )}
      {...props}
    >
      <Image
        src={imageSrc ?? undefined}
        alt={alt ?? name ?? "Avatar"}
        loading={loading}
        wrapperClassName="absolute inset-0"
        className={cn("size-full object-cover", imageClassName)}
        noImageComponent={fallbackNode}
        fallbackComponent={fallbackNode}
        loadingComponent={<Skeleton className="size-full" />}
      />
      {children}
    </div>
  );
}
