export type ApiKey = {
  id: string;
  project_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  key_last_four: string;
  status: "active" | "revoked" | "expired";
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertApiKey = Pick<ApiKey, "project_id" | "name"> & {
  expires_at?: string | null;
};
