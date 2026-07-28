export type RateLimit = {
  id: string;
  project_id: string;
  name: string;
  max_requests: number;
  window_ms: number;
  strategy: "token_bucket" | "sliding_window" | "fixed_window";
  scope: "global" | "user" | "ip" | "key";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type InsertRateLimit = Pick<
  RateLimit,
  "project_id" | "name" | "max_requests" | "window_ms" | "strategy" | "scope"
>;
