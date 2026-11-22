import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterviewStatus, RecentInterview } from "@/types";

const statusTone: Record<InterviewStatus, "success" | "warning" | "info"> = {
  Completed: "success",
  "In Progress": "warning",
  Scheduled: "info",
};

export function RecentInterviews({ items }: { items: RecentInterview[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Recent interviews</CardTitle>
          <CardDescription>Demo data for foundation UI — not connected to a database.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-[0.08em] text-ink-400">
                <th className="pb-3 pr-4 font-medium">Candidate</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-ink-50 last:border-0">
                  <td className="py-3.5 pr-4 font-medium text-ink-900">{item.candidate}</td>
                  <td className="py-3.5 pr-4 text-ink-600">{item.role}</td>
                  <td className="py-3.5 pr-4 text-ink-600">{item.interviewType}</td>
                  <td className="py-3.5 pr-4 text-ink-500">{item.date}</td>
                  <td className="py-3.5 pr-4">
                    <Badge tone={statusTone[item.status]}>{item.status}</Badge>
                  </td>
                  <td className="py-3.5 font-medium text-ink-800">
                    {item.score === null ? "—" : `${item.score}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
