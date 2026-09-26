export const roles = [
  "owner",
  "general_manager",
  "ecommerce_manager",
  "operator",
  "viewer",
] as const;
export type WorkspaceRole = (typeof roles)[number];
export type Action =
  | "workspace.manage"
  | "members.manage"
  | "connections.manage"
  | "brands.write"
  | "branches.write"
  | "branches.view"
  | "catalog.view"
  | "catalog.draft"
  | "availability.request"
  | "financial.approve"
  | "audit.view";

const permissions: Record<WorkspaceRole, readonly Action[]> = {
  owner: [
    "workspace.manage",
    "members.manage",
    "connections.manage",
    "brands.write",
    "branches.write",
    "branches.view",
    "catalog.view",
    "catalog.draft",
    "availability.request",
    "financial.approve",
    "audit.view",
  ],
  general_manager: [
    "brands.write",
    "branches.write",
    "branches.view",
    "catalog.view",
    "catalog.draft",
    "availability.request",
    "financial.approve",
    "audit.view",
  ],
  ecommerce_manager: [
    "brands.write",
    "branches.write",
    "branches.view",
    "catalog.view",
    "catalog.draft",
    "availability.request",
    "audit.view",
  ],
  operator: ["branches.view", "catalog.view", "availability.request", "audit.view"],
  viewer: ["branches.view", "catalog.view", "audit.view"],
};

export function can(role: WorkspaceRole, action: Action): boolean {
  return permissions[role].includes(action);
}

export function canAccessBranch(
  role: WorkspaceRole,
  branchId: string,
  scopeAllBranches: boolean,
  assignedBranchIds: readonly string[],
): boolean {
  return can(role, "branches.view") && (scopeAllBranches || assignedBranchIds.includes(branchId));
}
