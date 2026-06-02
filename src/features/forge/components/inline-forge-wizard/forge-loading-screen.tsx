import { ForgeNodeCanvas } from "@/features/forge/components/loading/forge-node-canvas";

interface ForgeLoadingScreenProps {
  progress: number;
}

export function ForgeLoadingScreen({ progress }: ForgeLoadingScreenProps) {
  return <ForgeNodeCanvas progress={progress} />;
}
