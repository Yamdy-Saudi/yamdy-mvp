import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { validateWorkspaceInput } from "../domain/onboarding";
import type { Database } from "../types/database.generated";

export type WorkspaceSummary = {
  id: string;
  name: string;
  onboardingStage: "connect" | "import" | "complete";
  reportingMode: "demo" | "client_export";
  role: string;
};

export const SELECTED_WORKSPACE_KEY = "yamdy.selectedWorkspaceId";

export function chooseWorkspace(workspaces: WorkspaceSummary[]): WorkspaceSummary | null {
  const saved =
    typeof window === "undefined" ? null : window.localStorage.getItem(SELECTED_WORKSPACE_KEY);
  return (
    workspaces.find((workspace) => workspace.id === saved) ??
    workspaces.find((workspace) => workspace.reportingMode === "client_export") ??
    workspaces[0] ??
    null
  );
}

function configuredClient() {
  const client = getSupabase();
  if (!client)
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  return client;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await configuredClient().auth.getUser();
  if (error) return null;
  return data.user;
}

export async function loadWorkspace(): Promise<WorkspaceSummary | null> {
  return loadWorkspaceWith(configuredClient());
}

export async function loadWorkspaceWith(
  client: SupabaseClient<Database>,
): Promise<WorkspaceSummary | null> {
  return chooseWorkspace(await loadWorkspacesWith(client));
}

export async function loadWorkspaces(): Promise<WorkspaceSummary[]> {
  return loadWorkspacesWith(configuredClient());
}

export async function loadWorkspacesWith(
  client: SupabaseClient<Database>,
): Promise<WorkspaceSummary[]> {
  const { data: memberships, error: membershipError } = await client
    .from("workspace_memberships")
    .select("workspace_id, role")
    .eq("status", "active");
  if (membershipError) throw membershipError;
  if (!memberships?.length) return [];
  const { data: workspaces, error } = await client
    .from("workspaces")
    .select("id, name, onboarding_stage, reporting_mode")
    .in(
      "id",
      memberships.map((membership) => membership.workspace_id),
    );
  if (error) throw error;
  return (workspaces ?? []).map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    reportingMode: workspace.reporting_mode === "client_export" ? "client_export" : "demo",
    onboardingStage:
      workspace.onboarding_stage === "import" || workspace.onboarding_stage === "complete"
        ? workspace.onboarding_stage
        : "connect",
    role: memberships.find((membership) => membership.workspace_id === workspace.id)!.role,
  }));
}

export async function createWorkspaceAccount(input: {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  primaryRole: string;
  acceptedTerms: boolean;
}): Promise<{ needsEmailConfirmation: boolean }> {
  return createWorkspaceAccountWith(configuredClient(), input);
}

export async function createWorkspaceAccountWith(
  client: SupabaseClient<Database>,
  input: {
    fullName: string;
    email: string;
    password: string;
    businessName: string;
    primaryRole: string;
    acceptedTerms: boolean;
  },
): Promise<{ needsEmailConfirmation: boolean }> {
  const validation = validateWorkspaceInput(input);
  if (validation) throw new Error(validation);
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: `${typeof window === "undefined" ? "https://yamdy.lovable.app" : window.location.origin}/auth/callback?flow=confirmation`,
      data: {
        full_name: input.fullName.trim(),
        pending_workspace_name: input.businessName.trim(),
        primary_role_label: input.primaryRole,
      },
    },
  });
  if (error) throw error;
  if (!data.session) return { needsEmailConfirmation: true };
  const { error: workspaceError } = await client.rpc("create_workspace", {
    p_name: input.businessName.trim(),
  });
  if (workspaceError) throw workspaceError;
  return { needsEmailConfirmation: false };
}

export async function signIn(email: string, password: string): Promise<WorkspaceSummary | null> {
  return signInWith(configuredClient(), email, password);
}

export async function signInWith(
  client: SupabaseClient<Database>,
  email: string,
  password: string,
): Promise<WorkspaceSummary | null> {
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  let workspace = await loadWorkspaceWith(client);
  if (!workspace) {
    const pendingName = data.user.user_metadata["pending_workspace_name"];
    if (typeof pendingName === "string" && pendingName.length >= 2) {
      const { error: createError } = await client.rpc("create_workspace", { p_name: pendingName });
      if (createError) throw createError;
      workspace = await loadWorkspaceWith(client);
    }
  }
  return workspace;
}

export async function signOut(): Promise<void> {
  const { error } = await configuredClient().auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  return requestPasswordResetWith(configuredClient(), email, window.location.origin);
}

export async function requestPasswordResetWith(
  client: SupabaseClient<Database>,
  email: string,
  origin: string,
): Promise<void> {
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function requestMagicLink(email: string): Promise<void> {
  return requestMagicLinkWith(configuredClient(), email, window.location.origin);
}

export async function requestMagicLinkWith(
  client: SupabaseClient<Database>,
  email: string,
  origin: string,
): Promise<void> {
  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?flow=magic-link`,
    },
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  return updatePasswordWith(configuredClient(), password);
}

export async function updatePasswordWith(
  client: SupabaseClient<Database>,
  password: string,
): Promise<void> {
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}
