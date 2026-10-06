const providers = [
  { name: "Google", icon: "G" },
  { name: "Apple", icon: "" },
  { name: "GitHub", icon: "GH" },
];

export default function SocialButtons(): React.ReactNode {
  return (
    <div className="flex gap-3">
      {providers.map((p) => (
        <button
          key={p.name}
          type="button"
          aria-label={`Continue with ${p.name}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {/* 这里换成真实图标组件 */}
          <span className="font-bold">{p.icon}</span>
          <span className="hidden sm:inline">{p.name}</span>
        </button>
      ))}
    </div>
  );
}
