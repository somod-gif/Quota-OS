export const siteConfig = {
  name: "QuotaOS",
  description:
    "The AI-Native Control Plane for External APIs. Manage authentication, rate limiting, quotas, and analytics from one unified dashboard.",
  url: "https://quotaos.com",
  ogImage: "https://quotaos.com/og.png",
  links: {
    twitter: "https://twitter.com/quotaos",
    github: "https://github.com/quotaos/quotaos",
  },
} as const;

export const dashboardConfig = {
  sidebarNav: [
    { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Projects", href: "/dashboard/projects", icon: "FolderKanban" },
    { title: "API Keys", href: "/dashboard/api-keys", icon: "KeyRound" },
    { title: "Providers", href: "/dashboard/providers", icon: "Cable" },
    { title: "Gateway", href: "/dashboard/gateway", icon: "Network" },
    { title: "Usage", href: "/dashboard/usage", icon: "BarChart3" },
    { title: "Logs", href: "/dashboard/logs", icon: "ScrollText" },
    { title: "Rate Limits", href: "/dashboard/rate-limits", icon: "Gauge" },
    { title: "Alerts", href: "/dashboard/alerts", icon: "BellRing" },
    { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
  ] as const,
};
