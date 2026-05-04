interface AnvilDefsProps {
  anvilGradientId: string;
  hammerGradientId: string;
}

export function AnvilDefs({
  anvilGradientId,
  hammerGradientId,
}: AnvilDefsProps) {
  return (
    <defs>
      <linearGradient
        id={anvilGradientId}
        x1="64"
        x2="154"
        y1="106"
        y2="160"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3A3A36" />
        <stop offset="1" stopColor="#171716" />
      </linearGradient>
      <linearGradient
        id={hammerGradientId}
        x1="83"
        x2="114"
        y1="69"
        y2="99"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#555550" />
        <stop offset="1" stopColor="#222220" />
      </linearGradient>
    </defs>
  );
}
