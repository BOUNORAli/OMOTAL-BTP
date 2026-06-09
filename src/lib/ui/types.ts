import type { ElementType, ReactNode } from "react";
import type { Permission } from "@/lib/domain/permissions";

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type NavItem = {
  href: string;
  icon: ElementType;
  label: string;
  permission: Permission;
};

export type PageAction = {
  label: string;
  href?: string;
  icon?: ElementType;
  permission?: Permission;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export type TableViewState = {
  search: string;
  chantierId: string;
  status: string;
  module: string;
  from: string;
  to: string;
};

export type FilterDefinition = {
  id: keyof TableViewState | string;
  label: string;
  type: "search" | "select" | "date";
  options?: Array<{ label: string; value: string }>;
};

export type DrawerMode = "view" | "create" | "edit" | "validate";

export type ModuleWorkflowStatus = "draft" | "submitted" | "validated" | "locked" | "blocked" | "unavailable";

export type MetricItem = {
  label: string;
  value: ReactNode;
  caption?: string;
  icon?: ElementType;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  href?: string;
};
