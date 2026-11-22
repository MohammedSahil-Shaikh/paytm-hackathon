export function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[rgba(15,27,45,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#93a4bd]">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#4f7cff]">
        Foundation shell · Member 3 will flesh out UI
      </p>
    </div>
  );
}
