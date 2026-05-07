import { memo } from "react";

export const MoreOverlay = memo(({ count }: { count: number }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
    <div className="scale-90 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-transform duration-500 group-hover/gallery-item:scale-110">
      <span className="text-2xl font-black tracking-tighter text-white">
        +{count - 4}
      </span>
    </div>
    <span className="mt-2 text-micro font-bold tracking-widest text-white/60 uppercase">
      Discover More
    </span>
  </div>
));
