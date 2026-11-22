import { Eyebrow, Surface } from "@/components/ui/surface";

export function PlaceholderPanel({
  title,
  description,
  meta = "Journey module",
}: {
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <Surface>
      <Eyebrow>{meta}</Eyebrow>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink-50">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">
        {description}
      </p>
    </Surface>
  );
}
