import { NotFoundEmptyTableVisual } from "@/assets/empty-state/not-found-empty-table";

export function SoloActivityScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-20 mx-auto w-full max-w-sm px-8 lg:top-1/2 lg:right-auto lg:left-8 lg:max-w-xl lg:-translate-y-1/2 lg:px-0 xl:left-16">
        <div className="solo-activity-breathe relative">
          <NotFoundEmptyTableVisual className="w-full text-ink drop-shadow-xl" />
        </div>
      </div>
    </div>
  );
}
