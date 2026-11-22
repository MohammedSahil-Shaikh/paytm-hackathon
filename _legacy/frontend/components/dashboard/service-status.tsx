"use client";

import { useEffect, useState } from "react";
import { Activity, LoaderCircle } from "lucide-react";
import { checkServiceHealth } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ServiceName, ServiceStatusState } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatusMap = Record<ServiceName, ServiceStatusState>;

const labels: Record<ServiceName, string> = {
  frontend: "Frontend",
  backend: "Backend",
  ai: "AI Service",
};

function StatusDot({ state }: { state: ServiceStatusState }) {
  if (state === "checking") {
    return <LoaderCircle className="h-3.5 w-3.5 animate-spin text-ink-400" />;
  }

  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full",
        state === "connected" ? "bg-emerald-500" : "bg-rose-500",
      )}
    />
  );
}

function statusLabel(state: ServiceStatusState) {
  if (state === "checking") return "Checking";
  if (state === "connected") return "Connected";
  return "Disconnected";
}

export function ServiceStatus() {
  const [status, setStatus] = useState<StatusMap>({
    frontend: "connected",
    backend: "checking",
    ai: "checking",
  });

  useEffect(() => {
    let cancelled = false;

    async function runChecks() {
      const [backend, ai] = await Promise.all([
        checkServiceHealth("backend"),
        checkServiceHealth("ai"),
      ]);

      if (!cancelled) {
        setStatus({
          frontend: "connected",
          backend,
          ai,
        });
      }
    }

    void runChecks();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Service status</CardTitle>
            <CardDescription>
              One-time health check for local development. Failures never block the dashboard.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(labels) as ServiceName[]).map((service) => (
            <div
              key={service}
              className="flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50/70 px-3 py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink-800">{labels[service]}</p>
                <p className="mt-0.5 text-xs text-ink-500">{statusLabel(status[service])}</p>
              </div>
              <StatusDot state={status[service]} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
