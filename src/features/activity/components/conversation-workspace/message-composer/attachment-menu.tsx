import {
  FileText,
  Image as ImageIcon,
  Lightbulb,
  type LucideIcon,
  Paperclip,
} from "lucide-react";
import { useRef } from "react";
import {
  ACTIVITY_MENU_ITEM_CLASS,
  getActivityMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
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
  onCreateProposal?: () => void;
  onSelectImages: (files: File[]) => void;
  onSelectFiles: (files: File[]) => void;
}

function toFiles(fileList: FileList | null) {
  return fileList ? Array.from(fileList) : [];
}

export function AttachmentMenu({
  disabled,
  onCreateProposal,
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
        aria-label="Choose photos"
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
        aria-label="Choose documents"
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
                className="size-11 cursor-pointer rounded-full outline-none [@media(pointer:fine)]:size-8"
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
          className={getActivityMenuContentClass("w-52 p-1.5")}
        >
          {onCreateProposal ? (
            <DropdownMenuItem
              className={ACTIVITY_MENU_ITEM_CLASS}
              onSelect={() => onCreateProposal()}
            >
              <AttachmentMenuRow icon={Lightbulb} label="Create proposal" />
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className={ACTIVITY_MENU_ITEM_CLASS}
            onSelect={(event) => {
              event.preventDefault();
              imageInputRef.current?.click();
            }}
          >
            <AttachmentMenuRow icon={ImageIcon} label="Photos" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className={ACTIVITY_MENU_ITEM_CLASS}
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
}

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
          "border border-border/40 bg-input text-primary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-bold text-xs">{label}</span>
    </>
  );
}
