export type Alert = {
  id: string;
  project_id: string;
  name: string;
  metric: "error_rate" | "latency" | "rate_limit" | "usage" | "quota";
  condition: "gt" | "lt" | "gte" | "lte" | "eq";
  threshold: number;
  window_ms: number;
  channels: ("email" | "slack" | "webhook")[];
  enabled: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertAlert = Pick<
  Alert,
  "project_id" | "name" | "metric" | "condition" | "threshold" | "window_ms" | "channels"
>;
