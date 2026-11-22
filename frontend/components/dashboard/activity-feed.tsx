import {
  CalendarClock,
  CheckCircle2,
  FileBarChart,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/types";

const iconMap = {
  completed: CheckCircle2,
  candidate: UserPlus,
  report: FileBarChart,
  scheduled: CalendarClock,
} as const;

const iconTone = {
  completed: "bg-emerald-50 text-emerald-600",
  candidate: "bg-brand-50 text-brand-600",
  report: "bg-sky-50 text-sky-600",
  scheduled: "bg-amber-50 text-amber-600",
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Sample events for the dashboard shell.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const Icon = iconMap[item.type];
          return (
            <div key={item.id} className="flex gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone[item.type]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{item.description}</p>
                <p className="mt-1 text-xs text-ink-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
