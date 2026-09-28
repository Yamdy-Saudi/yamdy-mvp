import { getSupabase } from "./supabase";
import type { Database, Json } from "../types/database.generated";

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export type DemoData = {
  branches: Row<"branches">[];
  products: Row<"catalog_products">[];
  productStates: Row<"product_branch_state">[];
  opportunities: Row<"opportunities">[];
  approvals: Row<"approval_requests">[];
  executions: Row<"demo_executions">[];
  audit: Row<"demo_audit_events">[];
  drafts: Row<"demo_drafts">[];
  performance: Row<"performance_daily">[];
  orderPerformance: Row<"order_performance_daily">[];
  orderImports: Row<"order_import_batches">[];
  memberships: Row<"workspace_memberships">[];
  connections: Row<"aggregator_connections">[];
};

function api() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

export async function bootstrapDemo(workspaceId: string): Promise<void> {
  const { error } = await api().rpc("bootstrap_demo_workspace", { p_workspace_id: workspaceId });
  if (error) throw error;
}

export async function loadDemoData(workspaceId: string): Promise<DemoData> {
  const client = api();
  const [
    branches,
    products,
    productStates,
    opportunities,
    approvals,
    executions,
    audit,
    drafts,
    performance,
    orderPerformance,
    orderImports,
    memberships,
    connections,
  ] = await Promise.all([
    client.from("branches").select("*").eq("workspace_id", workspaceId).order("name"),
    client.from("catalog_products").select("*").eq("workspace_id", workspaceId).order("name_en"),
    client.from("product_branch_state").select("*").eq("workspace_id", workspaceId),
    client
      .from("opportunities")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    client
      .from("approval_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    client
      .from("demo_executions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    client
      .from("demo_audit_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("demo_drafts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    client.from("performance_daily").select("*").eq("workspace_id", workspaceId).order("day"),
    client.from("order_performance_daily").select("*").eq("workspace_id", workspaceId).order("day"),
    client.from("order_import_batches").select("*").eq("workspace_id", workspaceId),
    client.from("workspace_memberships").select("*").eq("workspace_id", workspaceId),
    client.from("aggregator_connections").select("*").eq("workspace_id", workspaceId),
  ]);
  const results = [
    branches,
    products,
    productStates,
    opportunities,
    approvals,
    executions,
    audit,
    drafts,
    performance,
    orderPerformance,
    orderImports,
    memberships,
    connections,
  ];
  for (const result of results) if (result.error) throw result.error;
  return {
    branches: branches.data ?? [],
    products: products.data ?? [],
    productStates: productStates.data ?? [],
    opportunities: opportunities.data ?? [],
    approvals: approvals.data ?? [],
    executions: executions.data ?? [],
    audit: audit.data ?? [],
    drafts: drafts.data ?? [],
    performance: performance.data ?? [],
    orderPerformance: orderPerformance.data ?? [],
    orderImports: orderImports.data ?? [],
    memberships: memberships.data ?? [],
    connections: connections.data ?? [],
  };
}

export async function updateOpportunity(id: string, action: "dismiss" | "resolve" | "request") {
  const { error } = await api().rpc("demo_update_opportunity", {
    p_opportunity_id: id,
    p_action: action,
  });
  if (error) throw error;
}

export async function decideApproval(
  id: string,
  decision: "approved" | "rejected",
  reason: string,
) {
  const { error } = await api().rpc("demo_decide_approval", {
    p_approval_id: id,
    p_decision: decision,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function saveProductDraft(input: {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  priceSar: number;
}) {
  const { error } = await api().rpc("demo_save_product_draft", {
    p_product_id: input.id,
    p_name_en: input.nameEn,
    p_name_ar: input.nameAr,
    p_description_en: input.descriptionEn,
    p_price_sar: input.priceSar,
  });
  if (error) throw error;
}

export async function saveDemoDraft(
  workspaceId: string,
  kind: "promotion" | "bundle" | "campaign" | "content",
  title: string,
  payload: Json,
) {
  const { error } = await api().rpc("demo_save_draft", {
    p_workspace_id: workspaceId,
    p_kind: kind,
    p_title: title,
    p_payload: payload,
  });
  if (error) throw error;
}
