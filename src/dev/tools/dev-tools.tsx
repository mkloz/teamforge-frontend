import { Wrench } from "lucide-react";
import { useState } from "react";
import { BoxBordersSwitch } from "@/dev/tools/box-borders-switch";
import { QueryDevtoolsPanel } from "@/dev/tools/query-devtools-panel";
import { ScenarioModePanel } from "@/dev/tools/scenario-mode-panel";
import { TailwindBreakpointBadge } from "@/dev/tools/tailwind-indicator";
import { Button } from "@/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function DevTools() {
  const [isOpen, setIsOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<"query" | "scenario" | null>(
    null,
  );

  function handleRailOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setActivePanel(null);
    }
  }

  function handlePanelOpenChange(panel: "query" | "scenario", open: boolean) {
    setActivePanel(open ? panel : null);
  }

  return (
    <div className="fixed top-3 right-3 z-10000" data-development-tools>
      <Collapsible
        className="flex flex-col items-end gap-2"
        onOpenChange={handleRailOpenChange}
        open={isOpen}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger asChild>
              <Button
                aria-label={
                  isOpen ? "Close developer tools" : "Open developer tools"
                }
                className="size-9 rounded-full border border-border/70 bg-card/95 p-0 text-muted-foreground shadow-xl backdrop-blur-md hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Wrench
                  aria-hidden="true"
                  className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-45 text-foreground" : ""}`}
                />
                <TailwindBreakpointBadge />
              </Button>
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isOpen ? "Close developer tools" : "Open developer tools"}
          </TooltipContent>
        </Tooltip>

        <CollapsibleContent className="overflow-visible! w-11">
          <div className="grid grid-cols-1 grid-rows-3 justify-items-center gap-1 rounded-full border border-border/70 bg-card/95 p-1 shadow-xl">
            <ScenarioModePanel
              isOpen={activePanel === "scenario"}
              onOpenChange={(open) => handlePanelOpenChange("scenario", open)}
            />
            <QueryDevtoolsPanel
              isOpen={activePanel === "query"}
              onOpenChange={(open) => handlePanelOpenChange("query", open)}
            />
            <BoxBordersSwitch />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
