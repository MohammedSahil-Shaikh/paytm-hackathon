import { Award, CheckCircle2, ClipboardList, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StatCardData } from "@/types";

const iconMap = {
  interviews: ClipboardList,
  candidates: Users,
  completed: CheckCircle2,
  score: Award,
} as const;

export function StatCard({
  data,
  icon,
}: {
  data: StatCardData;
  icon: keyof typeof iconMap;
}) {
  const Icon = iconMap[icon];

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            {data.trend}
          </span>
        </div>
        <p className="mt-4 text-sm font-medium text-ink-500">{data.label}</p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">
          {data.value}
        </p>
        <p className="mt-2 text-xs text-ink-400">{data.hint}</p>
      </CardContent>
    </Card>
  );
}
