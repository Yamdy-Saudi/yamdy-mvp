import { mockHungerStationAdapter } from "../integrations/hungerstation/mock";
import { getSupabase } from "./supabase";

function client() {
  const value = getSupabase();
  if (!value) throw new Error("Supabase is not configured.");
  return value;
}

export async function loadMockConnection(workspaceId: string) {
  const { data, error } = await client()
    .from("aggregator_connections")
    .select("id, provider, mode, status")
    .eq("workspace_id", workspaceId)
    .eq("provider", "hungerstation")
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; provider: string; mode: string; status: string } | null;
}

export async function connectMockHungerStation(workspaceId: string): Promise<string> {
  const { data, error } = await client().rpc("create_mock_connection", {
    p_workspace_id: workspaceId,
  });
  if (error) throw error;
  return data as string;
}

export async function importMockBusiness(
  workspaceId: string,
  connectionId: string,
  selectedCodes: readonly string[],
): Promise<number> {
  const api = client();
  const preview = await mockHungerStationAdapter.previewBusiness();
  const selected = preview.branches.filter((branch) => selectedCodes.includes(branch.code));
  if (selected.length === 0) throw new Error("Select at least one branch.");
  const { data: connection, error: connectionError } = await api
    .from("aggregator_connections")
    .select("id, mode, workspace_id")
    .eq("id", connectionId)
    .eq("workspace_id", workspaceId)
    .single();
  if (connectionError) throw connectionError;
  if (connection.mode !== "mock")
    throw new Error("This import is available only for a demo connection.");

  const { error: brandInsertError } = await api.from("brands").upsert(
    {
      workspace_id: workspaceId,
      name: preview.brandName,
      name_ar: preview.brandNameAr,
      is_demo: true,
    },
    { onConflict: "workspace_id,name", ignoreDuplicates: true },
  );
  if (brandInsertError) throw brandInsertError;
  const { data: brand, error: brandError } = await api
    .from("brands")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("name", preview.brandName)
    .single();
  if (brandError) throw brandError;

  for (const branch of selected) {
    const { error: branchInsertError } = await api.from("branches").upsert(
      {
        workspace_id: workspaceId,
        brand_id: brand.id,
        code: branch.code,
        name: branch.name,
        name_ar: branch.nameAr,
        city: branch.city,
        timezone: "Asia/Riyadh",
        is_demo: true,
      },
      { onConflict: "workspace_id,code", ignoreDuplicates: true },
    );
    if (branchInsertError) throw branchInsertError;
    const { data: saved, error: branchError } = await api
      .from("branches")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("code", branch.code)
      .single();
    if (branchError) throw branchError;
    const { error: linkError } = await api.from("aggregator_branch_links").upsert(
      {
        workspace_id: workspaceId,
        connection_id: connectionId,
        branch_id: saved.id,
        external_vendor_id: branch.externalVendorId,
        is_demo: true,
      },
      { onConflict: "connection_id,branch_id", ignoreDuplicates: true },
    );
    if (linkError) throw linkError;
  }
  const { error: stageError } = await api
    .from("workspaces")
    .update({ onboarding_stage: "complete", updated_at: new Date().toISOString() })
    .eq("id", workspaceId);
  if (stageError) throw stageError;
  const { error: demoError } = await api.rpc("bootstrap_demo_workspace", {
    p_workspace_id: workspaceId,
  });
  if (demoError) throw demoError;
  return selected.length;
}
