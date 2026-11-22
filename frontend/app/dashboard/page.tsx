import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentInterviews } from "@/components/dashboard/recent-interviews";
import { ServiceStatus } from "@/components/dashboard/service-status";
import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import {
  mockActivity,
  mockRecentInterviews,
  mockStats,
} from "@/features/dashboard/mock-data";

const statIcons = ["interviews", "candidates", "completed", "score"] as const;

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <WelcomeSection />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockStats.map((stat, index) => (
          <StatCard key={stat.id} data={stat} icon={statIcons[index]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <RecentInterviews items={mockRecentInterviews} />
        <ActivityFeed items={mockActivity} />
      </section>

      <QuickActions />
      <ServiceStatus />
    </div>
  );
}
