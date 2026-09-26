import type { DemoData } from "../lib/demo";
import type { WorkspaceSummary } from "../lib/auth";

const workspaceId = "00000000-0000-4000-8000-000000000100";
const brandId = "00000000-0000-4000-8000-000000000101";
const branchIds = [
  "00000000-0000-4000-8000-000000000111",
  "00000000-0000-4000-8000-000000000112",
  "00000000-0000-4000-8000-000000000113",
];
const productIds = [
  "00000000-0000-4000-8000-000000000121",
  "00000000-0000-4000-8000-000000000122",
  "00000000-0000-4000-8000-000000000123",
  "00000000-0000-4000-8000-000000000124",
];
const opportunityIds = [
  "00000000-0000-4000-8000-000000000131",
  "00000000-0000-4000-8000-000000000132",
  "00000000-0000-4000-8000-000000000133",
  "00000000-0000-4000-8000-000000000134",
];
const now = new Date().toISOString();

export const previewWorkspace: WorkspaceSummary = {
  id: workspaceId,
  name: "Shawarma & Co.",
  onboardingStage: "complete",
  role: "owner",
};

export const previewData: DemoData = {
  branches: ["Riyadh — Olaya", "Riyadh — Al Nakheel", "Riyadh — Al Malqa"].map((name, index) => ({
    id: branchIds[index],
    workspace_id: workspaceId,
    brand_id: brandId,
    name,
    name_ar: ["الرياض — العليا", "الرياض — النخيل", "الرياض — الملقا"][index],
    code: `demo-${index}`,
    city: "Riyadh",
    timezone: "Asia/Riyadh",
    is_demo: true,
    created_at: now,
  })) as DemoData["branches"],
  products: [
    ["Classic Burger", "برجر كلاسيك", "Burgers", 42, 16.5, 76],
    ["Chicken Meal", "وجبة الدجاج", "Meals", 38, 14.2, 82],
    ["Shawarma Wrap", "ساندويتش شاورما", "Sandwiches", 29, 10.8, 91],
    ["Family Feast", "وجبة عائلية", "Bundles", 129, 53, 68],
  ].map(([name, nameAr, category, price, cost, quality], index) => ({
    id: productIds[index],
    workspace_id: workspaceId,
    brand_id: brandId,
    sku: `DEMO-${index}`,
    name_en: name,
    name_ar: nameAr,
    category,
    description_en: `Freshly prepared ${String(name).toLowerCase()} with house ingredients.`,
    price_sar: price,
    cost_sar: cost,
    listing_quality: quality,
    is_demo: true,
    updated_at: now,
  })) as DemoData["products"],
  productStates: productIds.flatMap((productId, pi) =>
    branchIds.map((branchId, bi) => ({
      workspace_id: workspaceId,
      product_id: productId,
      branch_id: branchId,
      is_available: !(pi === 1 && bi === 0),
      price_sar: [42, 38, 29, 129][pi],
      is_demo: true,
      updated_at: now,
    })),
  ) as DemoData["productStates"],
  opportunities: [
    [
      "operational",
      "Your best-selling Chicken Meal is unavailable",
      "The sample Olaya branch is unavailable during lunch.",
      "critical",
      860,
      94,
      productIds[1],
    ],
    [
      "pricing",
      "Your Classic Burger may be overpriced",
      "Review a simulated SAR 42 to SAR 39 price test.",
      "high",
      1320,
      78,
      productIds[0],
    ],
    [
      "marketing",
      "Lunch impressions are falling while conversion remains strong",
      "Explore an internal lunch campaign brief.",
      "medium",
      940,
      68,
      null,
    ],
    [
      "promotions",
      "Tuesday afternoon demand is consistently weak",
      "Explore an internal quiet-hour promotion draft.",
      "medium",
      620,
      71,
      null,
    ],
  ].map(([domain, title, description, priority, impact, confidence, productId], index) => ({
    id: opportunityIds[index],
    workspace_id: workspaceId,
    branch_id: branchIds[0],
    product_id: productId,
    demo_key: `preview-${index}`,
    domain,
    title,
    description,
    priority,
    status: index === 1 ? "in_review" : "recommended",
    estimated_impact_sar: impact,
    confidence,
    evidence: { source: "synthetic preview" },
    recommendation: { action: "internal review" },
    source: "demo",
    observed_at: now,
    created_at: now,
    updated_at: now,
  })) as DemoData["opportunities"],
  approvals: [
    {
      id: "00000000-0000-4000-8000-000000000141",
      workspace_id: workspaceId,
      opportunity_id: opportunityIds[1],
      branch_id: branchIds[0],
      requested_by: null,
      reviewed_by: null,
      status: "pending",
      rationale: "Seeded demo request",
      decided_at: null,
      created_at: now,
    },
  ] as DemoData["approvals"],
  executions: [],
  audit: [],
  drafts: [
    {
      id: "00000000-0000-4000-8000-000000000151",
      workspace_id: workspaceId,
      kind: "promotion",
      title: "Tuesday Afternoon Boost",
      payload: { objective: "Boost weak hours", discount: "15% sample offer" },
      status: "sample",
      created_by: null,
      is_demo: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: "00000000-0000-4000-8000-000000000152",
      workspace_id: workspaceId,
      kind: "bundle",
      title: "Family Lunch Combo",
      payload: { items: ["Chicken Meal", "Shawarma Wrap"], price_sar: 69 },
      status: "sample",
      created_by: null,
      is_demo: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: "00000000-0000-4000-8000-000000000153",
      workspace_id: workspaceId,
      kind: "campaign",
      title: "Lunch Rush Awareness",
      payload: { objective: "Increase lunch orders", budget_sar: 1200 },
      status: "sample",
      created_by: null,
      is_demo: true,
      created_at: now,
      updated_at: now,
    },
  ] as DemoData["drafts"],
  performance: branchIds.flatMap((branchId, bi) =>
    Array.from({ length: 28 }, (_, index) => {
      const day = new Date(Date.now() - (27 - index) * 86400000).toISOString().slice(0, 10);
      const orders = 48 + ((index * 7 + bi * 3) % 31);
      return {
        workspace_id: workspaceId,
        branch_id: branchId,
        day,
        orders,
        revenue_sar: orders * 39.5,
        ad_spend_sar: 80 + ((index * 11) % 38),
        source: "demo",
      };
    }),
  ) as DemoData["performance"],
  memberships: [
    {
      id: "00000000-0000-4000-8000-000000000161",
      workspace_id: workspaceId,
      user_id: "00000000-0000-4000-8000-000000000162",
      role: "owner",
      status: "active",
      scope_all_branches: true,
      created_at: now,
    },
  ] as DemoData["memberships"],
  connections: [
    {
      id: "00000000-0000-4000-8000-000000000171",
      workspace_id: workspaceId,
      provider: "hungerstation",
      mode: "mock",
      status: "mock_ready",
      display_name: "HungerStation",
      external_account_id: null,
      created_by: "00000000-0000-4000-8000-000000000162",
      created_at: now,
      updated_at: now,
    },
  ] as DemoData["connections"],
};
