import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";

export const AttachmentMenu = memo(({ disabled }: { disabled: boolean }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-slate-muted hover:text-forge-teal transition-colors outline-none cursor-pointer rounded-full"
        aria-label="Add attachment"
        disabled={disabled}
      >
        <Paperclip size={22} strokeWidth={2.2} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      sideOffset={16}
      className="w-50 p-2 rounded-2xl shadow-xl border-border/40 animate-in slide-in-from-bottom-2"
    >
      {[
        { icon: ImageIcon, label: "Photos & Videos", color: "text-forge-teal" },
        { icon: FileText, label: "Document", color: "text-forge-teal" },
      ].map((item) => (
        <DropdownMenuItem
          key={item.label}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-muted text-sm font-semibold text-ink transition-colors"
        >
          <item.icon size={18} className={item.color} />
          <span>{item.label}</span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
));
