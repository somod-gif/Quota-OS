export type Provider = {
  id: string;
  project_id: string;
  name: string;
  base_url: string;
  auth_type: "api_key" | "bearer" | "basic" | "oauth2" | "none";
  auth_config: Record<string, string> | null;
  rate_limit_rpm: number | null;
  rate_limit_rpd: number | null;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
};

export type InsertProvider = Pick<
  Provider,
  "project_id" | "name" | "base_url" | "auth_type"
> & {
  auth_config?: Record<string, string> | null;
  rate_limit_rpm?: number | null;
  rate_limit_rpd?: number | null;
};
