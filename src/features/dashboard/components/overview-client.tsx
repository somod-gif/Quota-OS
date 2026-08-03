"use client";

import { useQuery } from "@tanstack/react-query";
import { OverviewCards } from "@/features/dashboard/components/overview-cards";
import { RequestsChart } from "@/features/dashboard/components/requests-chart";
import { LatencyChart } from "@/features/dashboard/components/latency-chart";
import { ErrorRateCard } from "@/features/dashboard/components/error-rate-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsageOverview } from "@/features/usage/actions";

export function OverviewClient({ workspaceId }: { workspaceId: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard-overview", workspaceId],
    queryFn: () => getUsageOverview(workspaceId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <OverviewCards summary={data?.summary ?? null} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RequestsChart series={data?.series ?? []} />
        <LatencyChart series={data?.series ?? []} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2" />
        <ErrorRateCard summary={data?.summary ?? null} />
      </div>
    </>
  );
}
