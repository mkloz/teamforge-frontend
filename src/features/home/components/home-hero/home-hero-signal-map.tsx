export function HomeHeroSignalMap() {
  return (
    <div
      className="relative hidden min-h-72 overflow-hidden 2xl:block"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full text-forge-teal"
        viewBox="0 0 360 280"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="home-hero-flow"
            x1="28"
            y1="34"
            x2="330"
            y2="246"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0.04" />
            <stop offset="0.48" stopColor="currentColor" stopOpacity="0.46" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient
            id="home-hero-spark"
            x1="78"
            y1="44"
            x2="282"
            y2="236"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--color-spark-amber)" stopOpacity="0.08" />
            <stop
              offset="0.46"
              stopColor="var(--color-spark-amber)"
              stopOpacity="0.86"
            />
            <stop
              offset="1"
              stopColor="var(--color-spark-amber)"
              stopOpacity="0.14"
            />
          </linearGradient>
        </defs>

        <path
          d="M24 78 C78 42 122 56 162 94 C205 135 248 116 328 78"
          stroke="url(#home-hero-flow)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M28 214 C88 158 134 150 190 170 C244 188 284 164 334 126"
          stroke="url(#home-hero-flow)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M50 160 C92 124 126 122 164 142 C202 162 236 150 302 92"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M68 106 L124 138 L176 110 L236 146 L294 114"
          stroke="currentColor"
          strokeOpacity="0.24"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
        <path
          d="M82 230 H184"
          stroke="url(#home-hero-spark)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M98 246 H224"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M242 52 H338"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M256 72 H322"
          stroke="var(--color-spark-amber)"
          strokeOpacity="0.86"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M236 92 H334"
          stroke="currentColor"
          strokeOpacity="0.34"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M168 80 L216 108 L214 164 L166 190 L118 162 L120 108 Z"
          fill="currentColor"
          fillOpacity="0.055"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <path
          d="M168 105 L194 120 L193 150 L167 165 L141 150 L142 120 Z"
          fill="currentColor"
          fillOpacity="0.62"
        />
        <path
          d="M168 80 V105"
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M216 108 L194 120"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M214 164 L193 150"
          stroke="var(--color-spark-amber)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M118 162 L141 150"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <circle cx="78" cy="106" r="5" fill="currentColor" fillOpacity="0.68" />
        <circle
          cx="124"
          cy="138"
          r="7"
          fill="var(--color-spark-amber)"
          fillOpacity="0.94"
        />
        <circle
          cx="236"
          cy="146"
          r="5"
          fill="currentColor"
          fillOpacity="0.76"
        />
        <circle
          cx="294"
          cy="114"
          r="4"
          fill="currentColor"
          fillOpacity="0.64"
        />
        <circle
          cx="118"
          cy="222"
          r="4"
          fill="currentColor"
          fillOpacity="0.58"
        />
        <circle
          cx="246"
          cy="216"
          r="5"
          fill="currentColor"
          fillOpacity="0.74"
        />
        <circle
          cx="266"
          cy="216"
          r="7"
          fill="var(--color-spark-amber)"
          fillOpacity="0.94"
        />
        <circle
          cx="292"
          cy="216"
          r="10"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    </div>
  );
}
