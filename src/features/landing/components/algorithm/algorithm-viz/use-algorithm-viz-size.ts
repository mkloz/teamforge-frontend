import { useEffect, useRef, useState } from "react";

const DEFAULT_ALGORITHM_VIZ_SIZE = 380;
const MAX_ALGORITHM_VIZ_SIZE = 420;

export function useAlgorithmVizSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(DEFAULT_ALGORITHM_VIZ_SIZE);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const updateSize = () => {
      setSize(Math.min(container.offsetWidth, MAX_ALGORITHM_VIZ_SIZE));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}
