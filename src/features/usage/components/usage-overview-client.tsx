"use client";

import { useQuery } from "@tanstack/react-query";
import { UsageOverview } from "@/features/usage/components/usage-overview";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsageOverview } from "@/features/usage/actions";

export function UsageOverviewClient({ workspaceId }: { workspaceId: string }) {
  const { data, isFetching, isPending } = useQuery({
    queryKey: ["usage-overview", workspaceId],
    queryFn: () => getUsageOverview(workspaceId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <UsageOverview summary={data?.summary ?? null} series={data?.series ?? []} />
      {isFetching && !isPending && (
        <p className="text-xs text-muted-foreground animate-pulse">Refreshing…</p>
      )}
    </>
  );
}
