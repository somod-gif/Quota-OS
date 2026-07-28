export type Project = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertProject = Pick<Project, "workspace_id" | "name" | "slug"> & {
  description?: string | null;
};
