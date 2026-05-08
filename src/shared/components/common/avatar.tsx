import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { Image } from "@/shared/components/common/image";
import { cn } from "@/shared/lib/utils";

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
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  shape?: "circle" | "rounded";
}

export function Avatar({
  src,
  name,
  alt,
  fallback,
  className,
  imageClassName,
  fallbackClassName,
  loading = "lazy",
  shape = "circle",
  children,
  ...props
}: AvatarProps) {
  const initials = fallback ?? getAvatarInitials(name);
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const fallbackNode = (
    <div
      className={cn(
        "avatar-initials flex h-full w-full items-center justify-center bg-forge-teal/10 leading-none font-black text-forge-teal",
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
        src={src ?? undefined}
        alt={alt ?? name ?? "Avatar"}
        loading={loading}
        wrapperClassName="absolute inset-0"
        className={cn("h-full w-full object-cover", imageClassName)}
        noImageComponent={fallbackNode}
        fallbackComponent={fallbackNode}
        loadingComponent={
          <div className="h-full w-full animate-pulse bg-muted" />
        }
      />
      {children}
    </div>
  );
}
