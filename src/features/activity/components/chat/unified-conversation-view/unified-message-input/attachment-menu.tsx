import {
  FileText,
  Image as ImageIcon,
  type LucideIcon,
  Paperclip,
} from "lucide-react";
import { memo, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface AttachmentMenuProps {
  disabled: boolean;
  onSelectImages: (files: File[]) => void;
  onSelectFiles: (files: File[]) => void;
}

function toFiles(fileList: FileList | null) {
  return fileList ? Array.from(fileList) : [];
}

export const AttachmentMenu = memo(function AttachmentMenu({
  disabled,
  onSelectImages,
  onSelectFiles,
}: AttachmentMenuProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        name="chat-images"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          onSelectImages(toFiles(event.target.files));
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        name="chat-files"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        multiple
        className="hidden"
        onChange={(event) => {
          onSelectFiles(toFiles(event.target.files));
          event.currentTarget.value = "";
        }}
      />

      <DropdownMenu modal={false}>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="accentGhost"
                size="icon-sm"
                className="size-8 cursor-pointer rounded-full outline-none"
                aria-label="Add attachment"
                disabled={disabled}
              >
                <Paperclip className="size-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent>Add attachment</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="start"
          sideOffset={12}
          className="w-52 rounded-2xl rounded-bl-none border-border/55 bg-canvas/97 p-1.5 text-ink shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] backdrop-blur-xl dark:bg-forge-deep-surface/97"
        >
          <DropdownMenuItem
            className="min-h-10 cursor-pointer rounded-xl px-2.5 py-2 transition-colors focus:bg-forge-teal/8 focus:text-ink data-[highlighted]:bg-forge-teal/8 data-[highlighted]:text-ink"
            onSelect={(event) => {
              event.preventDefault();
              imageInputRef.current?.click();
            }}
          >
            <AttachmentMenuRow icon={ImageIcon} label="Photos" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-10 cursor-pointer rounded-xl px-2.5 py-2 transition-colors focus:bg-forge-teal/8 focus:text-ink data-[highlighted]:bg-forge-teal/8 data-[highlighted]:text-ink"
            onSelect={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <AttachmentMenuRow icon={FileText} label="Documents" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
});

function AttachmentMenuRow({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg",
          "border border-border/40 bg-background/65 text-forge-teal",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-bold text-xs">{label}</span>
    </>
  );
}
