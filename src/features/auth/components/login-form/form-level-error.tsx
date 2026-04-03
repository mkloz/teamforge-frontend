interface FormLevelErrorProps {
  message: string;
}

export function FormLevelError({ message }: FormLevelErrorProps) {
  return (
    <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50">
      <span className="text-red-500 text-xs font-medium">{message}</span>
    </div>
  );
}
