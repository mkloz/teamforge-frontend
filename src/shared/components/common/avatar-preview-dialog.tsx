import type { ReactNode } from "react";
import { Avatar } from "@/shared/components/common/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

interface AvatarPreviewDialogProps {
  children: ReactNode;
  name: string;
  src?: string | null;
  shape?: "circle" | "rounded";
}

export function AvatarPreviewDialog({
  children,
  name,
  src,
  shape = "circle",
}: AvatarPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-auto max-w-[calc(100vw-2rem)] gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:top-1 [&>button]:right-1 [&>button]:rounded-full [&>button]:border [&>button]:border-border/70 [&>button]:bg-card/90 [&>button]:shadow-sm">
        <DialogTitle className="sr-only">{name} avatar</DialogTitle>
        <DialogDescription className="sr-only">
          Expanded avatar for {name}.
        </DialogDescription>

        <div className="flex items-center justify-center rounded-full p-3">
          <Avatar
            src={src}
            name={name}
            shape={shape}
            className={cn(
              "size-64 bg-muted text-7xl shadow-2xl ring-4 ring-canvas/75 sm:size-80 sm:text-8xl md:size-96",
              shape === "rounded" && "rounded-2xl",
            )}
            fallbackClassName="bg-muted text-forge-teal"
            imageClassName="transition-transform duration-500"
            loading="eager"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
