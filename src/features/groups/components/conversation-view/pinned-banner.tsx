import { FileEdit, Check, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

interface PinnedBannerProps {
  title: string;
  description: string;
  onViewPlan: () => void;
  // For confirmation progress UI
  confirmationProgress?: {
    confirmed: number;
    total: number;
    memberAvatars: string[];
    confirmedIds: string[];
  };
}

export function PinnedBanner({ 
  title, 
  description, 
  onViewPlan,
  confirmationProgress,
}: PinnedBannerProps) {
  return (
    <button
      onClick={onViewPlan}
      className={cn(
        "flex-shrink-0 w-full flex items-center gap-3 px-4 py-2.5",
        "bg-amber-500/10 border-b border-amber-500/20",
        "hover:bg-amber-500/15 transition-colors text-left",
      )}
    >
      <FileEdit size={16} className="text-amber-500 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {confirmationProgress && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-1">
              {confirmationProgress.memberAvatars.slice(0, 4).map((avatar, i) => {
                const isConfirmed = i < confirmationProgress.confirmed;
                return (
                  <div key={i} className="relative">
                    <img
                      src={avatar}
                      alt=""
                      className={cn(
                        "w-5 h-5 rounded-full object-cover ring-1 ring-background",
                        !isConfirmed && "opacity-50",
                      )}
                    />
                    {isConfirmed && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={6} className="text-white" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {confirmationProgress.confirmed}/{confirmationProgress.total} confirmed
            </span>
          </div>
        )}
      </div>

      <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
    </button>
  );
}
