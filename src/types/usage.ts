export type UsageRecord = {
  id: string;
  project_id: string;
  timestamp: string;
  requests: number;
  blocked: number;
  rate_limited: number;
  cached: number;
  errors: number;
  avg_latency_ms: number;
  p99_latency_ms: number;
};

export type UsageSummary = {
  totalRequests: number;
  totalBlocked: number;
  totalRateLimited: number;
  totalCached: number;
  totalErrors: number;
  avgLatency: number;
  errorRate: number;
};

export type UsageSeries = {
  timestamp: string;
  requests: number;
  blocked: number;
  rate_limited: number;
  errors: number;
  latency: number;
};
