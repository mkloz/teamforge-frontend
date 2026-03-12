import { Zap, Check, CheckCheck } from "lucide-react";
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
    <div className="flex-shrink-0 mx-3 mt-3 p-3 rounded-xl bg-accent/10 border border-accent/30">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/20 flex-shrink-0">
          <Zap size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          
          {/* Confirmation progress indicator */}
          {confirmationProgress && (
            <div className="mt-2.5">
              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(confirmationProgress.confirmed / confirmationProgress.total) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-accent">
                  {confirmationProgress.confirmed}/{confirmationProgress.total}
                </span>
              </div>
              
              {/* Member avatars with confirmation status */}
              <div className="flex items-center gap-1">
                {confirmationProgress.memberAvatars.slice(0, 5).map((avatar, i) => {
                  const isConfirmed = i < confirmationProgress.confirmed;
                  return (
                    <div key={i} className="relative">
                      <img
                        src={avatar}
                        alt=""
                        className={cn(
                          "w-6 h-6 rounded-full object-cover ring-2",
                          isConfirmed ? "ring-accent" : "ring-muted",
                        )}
                      />
                      {isConfirmed && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
                          <Check size={8} className="text-accent-foreground" />
                        </span>
                      )}
                    </div>
                  );
                })}
                <span className="text-[10px] text-muted-foreground ml-1">
                  {confirmationProgress.confirmed === confirmationProgress.total
                    ? "All confirmed!"
                    : "Waiting for others..."}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            onClick={onViewPlan}
            className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 px-3"
          >
            <CheckCheck size={14} className="mr-1.5" />
            Confirm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewPlan}
            className="text-muted-foreground hover:text-foreground h-7 px-3 text-xs"
          >
            View Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
