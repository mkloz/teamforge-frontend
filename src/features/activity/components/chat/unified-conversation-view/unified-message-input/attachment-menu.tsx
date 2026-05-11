import { FileText, Image as ImageIcon, Paperclip } from "lucide-react";
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
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        multiple
        className="hidden"
        onChange={(event) => {
          onSelectFiles(toFiles(event.target.files));
          event.currentTarget.value = "";
        }}
      />

      <DropdownMenu>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="accentGhost"
                size="icon-sm"
                className="cursor-pointer rounded-full outline-none"
                aria-label="Add attachment"
                disabled={disabled}
              >
                <Paperclip className="size-5" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent>Add attachment</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="start"
          sideOffset={16}
          className="slide-in-from-bottom-2 w-50 animate-in rounded-xl border-border/40 p-2 shadow-xl"
        >
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-ink text-sm transition-colors focus:bg-muted"
            onSelect={(event) => {
              event.preventDefault();
              imageInputRef.current?.click();
            }}
          >
            <ImageIcon className="size-4 text-forge-teal" />
            <span>Photos</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-ink text-sm transition-colors focus:bg-muted"
            onSelect={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <FileText className="size-4 text-forge-teal" />
            <span>Documents</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
});
