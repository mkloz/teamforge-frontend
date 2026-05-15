import { ForgeLoadingAnvil } from "@/features/forge/components/loading/forge-loading-anvil";

interface ForgeLoadingScreenProps {
  strikeCount: number;
}

export function ForgeLoadingScreen({ strikeCount }: ForgeLoadingScreenProps) {
  return (
    <div className="relative flex min-h-96 w-full flex-col items-center justify-center gap-8 px-4">
      <ForgeLoadingAnvil
        strikeCount={strikeCount}
        size={240}
        className="relative"
      />
    </div>
  );
}
