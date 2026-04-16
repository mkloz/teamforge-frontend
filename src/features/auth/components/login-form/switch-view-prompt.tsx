interface SwitchViewPromptProps {
  onClick: () => void;
}

export function SwitchViewPrompt({ onClick }: SwitchViewPromptProps) {
  return (
    <p className="font-sans text-sm text-slate-muted text-center mt-6">
      New around here?{" "}
      <button
        type="button"
        onClick={onClick}
        className="font-semibold text-forge-teal hover:underline cursor-pointer transition-colors focus:outline-hidden"
      >
        Join the forge
      </button>
    </p>
  );
}
