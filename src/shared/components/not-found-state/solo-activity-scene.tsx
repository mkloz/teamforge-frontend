export function SoloActivityScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 h-px w-3/4 -translate-x-1/2 translate-y-24 bg-linear-to-r from-transparent via-ink/10 to-transparent" />

      <div className="absolute inset-x-0 top-20 mx-auto w-full max-w-lg px-8 lg:top-1/2 lg:right-auto lg:left-8 lg:max-w-xl lg:-translate-y-1/2 lg:px-0 xl:left-16">
        <div className="solo-activity-breathe relative">
          <div className="absolute top-18 left-4 z-10 flex h-8 items-center gap-2 rounded-full border border-border bg-card/85 px-3 font-black text-slate-muted text-xs shadow-sm backdrop-blur-sm sm:top-24 sm:left-8">
            <span className="size-2 rounded-full bg-spark-amber shadow-amber-glow" />
            <span>1/6</span>
          </div>

          <img
            src="/illustrations/solo-activity.png"
            width="1254"
            height="1254"
            alt=""
            className="w-full object-contain drop-shadow-xl"
            draggable={false}
          />
        </div>
      </div>

      <div className="absolute top-96 left-1/2 hidden h-28 w-72 -translate-x-2 -rotate-3 opacity-55 sm:block lg:top-1/2 lg:left-1/3">
        <svg
          viewBox="0 0 288 112"
          className="absolute inset-0 size-full text-slate-muted/40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 66 C76 54 111 54 154 74 C184 88 205 91 238 73"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 8"
            strokeLinecap="round"
          />
          <path
            d="M242 72 L260 60 M242 72 L260 84"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute right-0 bottom-2 flex size-12 items-center justify-center rounded-full border border-border bg-card/80 font-black text-slate-muted text-xs shadow-sm">
          404
        </div>
      </div>
    </div>
  );
}
