import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  varchar,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspace_members = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueMembership: primaryKey({ columns: [table.workspace_id, table.user_id] }),
  }),
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    token: varchar("token", { length: 64 }).notNull().unique(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    invited_by: uuid("invited_by").notNull(),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProjectSlug: uniqueIndex("unique_project_slug").on(table.workspace_id, table.slug),
}));

export const api_keys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  key_prefix: varchar("key_prefix", { length: 20 }).notNull(),
  key_hash: text("key_hash").notNull(),
  key_last_four: varchar("key_last_four", { length: 4 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  last_used_at: timestamp("last_used_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const providers = pgTable("providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  base_url: text("base_url").notNull(),
  auth_type: varchar("auth_type", { length: 20 }).notNull().default("api_key"),
  auth_config: jsonb("auth_config"),
  rate_limit_rpm: integer("rate_limit_rpm"),
  rate_limit_rpd: integer("rate_limit_rpd"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rate_limits = pgTable("rate_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  max_requests: integer("max_requests").notNull(),
  window_ms: integer("window_ms").notNull(),
  strategy: varchar("strategy", { length: 30 }).notNull().default("sliding_window"),
  scope: varchar("scope", { length: 20 }).notNull().default("global"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const gateway_endpoints = pgTable("gateway_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  path: text("path").notNull(),
  method: varchar("method", { length: 10 }).notNull().default("GET"),
  provider_id: uuid("provider_id").references(() => providers.id, { onDelete: "set null" }),
  target_url: text("target_url").notNull(),
  rate_limit_id: uuid("rate_limit_id").references(() => rate_limits.id, { onDelete: "set null" }),
  cache_ttl: integer("cache_ttl"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const request_logs = pgTable("request_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  endpoint_id: uuid("endpoint_id").references(() => gateway_endpoints.id, { onDelete: "set null" }),
  api_key_id: uuid("api_key_id").references(() => api_keys.id, { onDelete: "set null" }),
  method: varchar("method", { length: 10 }).notNull(),
  path: text("path").notNull(),
  status_code: integer("status_code"),
  latency_ms: integer("latency_ms"),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
  blocked: boolean("blocked").notNull().default(false),
  rate_limited: boolean("rate_limited").notNull().default(false),
  cached: boolean("cached").notNull().default(false),
  error: text("error"),
  request_headers: jsonb("request_headers"),
  response_headers: jsonb("response_headers"),
  request_body_size: integer("request_body_size"),
  response_body_size: integer("response_body_size"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  metric: varchar("metric", { length: 30 }).notNull(),
  condition: varchar("condition", { length: 10 }).notNull(),
  threshold: integer("threshold").notNull(),
  window_ms: integer("window_ms").notNull(),
  channels: text("channels").array().notNull().default(["email"]),
  enabled: boolean("enabled").notNull().default(true),
  last_triggered_at: timestamp("last_triggered_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usage_records = pgTable("usage_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  requests: integer("requests").notNull().default(0),
  blocked: integer("blocked").notNull().default(0),
  rate_limited: integer("rate_limited").notNull().default(0),
  cached: integer("cached").notNull().default(0),
  errors: integer("errors").notNull().default(0),
  avg_latency_ms: integer("avg_latency_ms").notNull().default(0),
  p99_latency_ms: integer("p99_latency_ms").notNull().default(0),
});
