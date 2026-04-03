import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { memo } from "react";

export const AttachmentMenu = memo(({ disabled }: { disabled: boolean }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="text-slate-muted hover:text-forge-teal transition-colors outline-none cursor-pointer"
        aria-label="Add attachment"
        disabled={disabled}
      >
        <Paperclip size={22} strokeWidth={2.2} />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      sideOffset={16}
      className="w-50 p-2 rounded-2xl shadow-xl border-border/40 animate-in slide-in-from-bottom-2"
    >
      {[
        { icon: ImageIcon, label: "Photos & Videos", color: "text-forge-teal" },
        { icon: FileText, label: "Document", color: "text-forge-teal" },
        {
          icon: ClipboardList,
          label: "New Proposal",
          color: "text-spark-amber",
        },
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
