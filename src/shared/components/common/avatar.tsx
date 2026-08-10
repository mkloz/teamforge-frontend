import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { Image } from "@/shared/components/common/image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getImageMediaVariant } from "@/shared/lib/image-media";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";
import type { ImageMedia } from "@/shared/schemas/media";

export function getAvatarInitials(name?: string | null) {
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
  media?: ImageMedia | null;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  shape?: "circle" | "rounded";
}

type AvatarShape = NonNullable<AvatarProps["shape"]>;

interface AvatarStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: OnlineStatus;
  borderClassName?: string;
  sizeClassName?: string;
}

const avatarStatusColors: Record<OnlineStatus, string> = {
  ONLINE: "bg-brand-teal",
  AWAY: "bg-brand-amber",
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
  media,
  loading = "lazy",
  shape = "circle",
  children,
  ...props
}: AvatarProps) {
  const radiusClass = getAvatarRadiusClass(shape);
  const fallbackNode = (
    <AvatarFallback
      className={fallbackClassName}
      content={getAvatarFallbackContent({ fallback, name })}
    />
  );

  return (
    <div
      className={cn(
        "relative flex aspect-square shrink-0 items-center justify-center overflow-visible bg-muted",
        radiusClass,
        className,
      )}
      {...props}
    >
      <Image
        src={getAvatarImageSrc({ imageSize, media, src })}
        alt={getAvatarAlt({ alt, name })}
        loading={loading}
        wrapperClassName={cn("absolute inset-0", radiusClass)}
        className={cn("size-full object-cover", imageClassName)}
        noImageComponent={fallbackNode}
        fallbackComponent={fallbackNode}
        loadingComponent={<Skeleton className="size-full" />}
      />
      {children}
    </div>
  );
}

function getAvatarRadiusClass(shape: AvatarShape) {
  return shape === "circle" ? "rounded-full" : "rounded-lg";
}

function getAvatarFallbackContent({
  fallback,
  name,
}: Pick<AvatarProps, "fallback" | "name">) {
  return fallback ?? getAvatarInitials(name);
}

function getAvatarImageSrc({
  imageSize,
  media,
  src,
}: Pick<AvatarProps, "imageSize" | "media" | "src">) {
  const resolvedSrc = getImageMediaVariant(media, "avatar128", src);
  const imageSrc = imageSize
    ? getSizedImageUrl(resolvedSrc, imageSize)
    : resolvedSrc;

  return imageSrc ?? undefined;
}

function getAvatarAlt({ alt, name }: Pick<AvatarProps, "alt" | "name">) {
  return alt ?? name ?? "Avatar";
}

function AvatarFallback({
  className,
  content,
}: {
  className?: string;
  content: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-primary-soft font-black text-foreground text-xs leading-none",
        className,
      )}
    >
      {content}
    </div>
  );
}
