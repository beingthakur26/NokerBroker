export function Chip({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`text-xs px-3.5 py-1.5 rounded-full border-[1.5px] ${
        active ? "bg-ink text-white border-ink" : "border-border text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}