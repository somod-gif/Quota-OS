export type GatewayEndpoint = {
  id: string;
  project_id: string;
  name: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  provider_id: string | null;
  target_url: string;
  rate_limit_id: string | null;
  cache_ttl: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type InsertGatewayEndpoint = Pick<
  GatewayEndpoint,
  "project_id" | "name" | "path" | "method" | "target_url"
> & {
  provider_id?: string | null;
  rate_limit_id?: string | null;
  cache_ttl?: number | null;
};
