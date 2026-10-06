export default function Divider({ text }: { text: string }): React.ReactNode {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">{text}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
