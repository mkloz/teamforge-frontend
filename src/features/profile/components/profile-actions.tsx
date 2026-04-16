import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle, UserPlus } from "lucide-react";

export function ProfileActions({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 pr-0 w-full sm:w-auto",
        className,
      )}
    >
      <Button className="flex-1 sm:w-auto shrink-0">
        <UserPlus />
        <span>Connect</span>
      </Button>
      <Button variant="outline" className="w-full sm:w-auto border-2">
        <MessageCircle />
        <span>Message</span>
      </Button>
    </div>
  );
}
