export type {
  Workspace,
  WorkspaceMember,
  WorkspaceMemberWithUser,
  WorkspaceRole,
  InsertWorkspace,
  UpdateWorkspace,
  Invitation,
  InvitationStatus,
  CreateInvitation,
} from "./workspace";

export { WORKSPACE_ROLES, INVITATION_STATUSES } from "./workspace";
export type { Project, InsertProject } from "./project";
export type { ApiKey, InsertApiKey } from "./api-key";
export type { Provider, InsertProvider } from "./provider";
export type { RateLimit, InsertRateLimit } from "./rate-limit";
export type { GatewayEndpoint, InsertGatewayEndpoint } from "./gateway";
export type { RequestLog } from "./request-log";
export type { Alert, InsertAlert } from "./alert";
export type { UsageRecord, UsageSummary, UsageSeries } from "./usage";

export type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
