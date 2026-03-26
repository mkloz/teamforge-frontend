import { Button } from "@/shared/components/ui/button";
import { MessageCircle, UserPlus } from "lucide-react";

export function ProfileActions() {
  return (
    <div className="flex flex-row items-center gap-3 pr-0 w-full">
      <Button className="w-full sm:w-auto">
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
