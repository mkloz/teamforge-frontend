import { memo } from "react";

export const MoreOverlay = memo(({ count }: { count: number }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
    <div className="scale-90 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-transform duration-500 group-hover/gallery-item:scale-110">
      <span className="font-black text-2xl text-white tracking-tighter">
        +{count - 4}
      </span>
    </div>
    <span className="mt-2 font-bold text-micro text-white/60 uppercase tracking-widest">
      Discover More
    </span>
  </div>
));
