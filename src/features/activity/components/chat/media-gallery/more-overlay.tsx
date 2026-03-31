import { memo } from "react";

export const MoreOverlay = memo(({ count }: { count: number }) => (
  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-md">
    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-xl scale-90 group-hover/gallery-item:scale-110 transition-transform duration-500">
      <span className="text-white font-black text-2xl tracking-tighter">
        +{count - 4}
      </span>
    </div>
    <span className="text-white/60 text-micro font-bold uppercase tracking-widest mt-2">
      Discover More
    </span>
  </div>
));
