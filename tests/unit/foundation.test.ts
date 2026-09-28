import assert from "node:assert/strict";
import { test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { can, canAccessBranch } from "../../src/domain/permissions";
import { nextOnboardingStage, validateWorkspaceInput } from "../../src/domain/onboarding";
import { mockHungerStationAdapter } from "../../src/integrations/hungerstation/mock";
import {
  chooseWorkspace,
  createWorkspaceAccountWith,
  type WorkspaceSummary,
} from "../../src/lib/auth";
import type { Database } from "../../src/types/database.generated";

const validAccount = {
  fullName: "Sultan Al-Otaibi",
  email: "sultan@example.com",
  password: "strong-password-123",
  businessName: "Shawarma & Co.",
  primaryRole: "Owner / Founder",
  acceptedTerms: true,
};

test("the client report is the default when an account has multiple workspaces", () => {
  const demo: WorkspaceSummary = {
    id: "demo",
    name: "Existing demo",
    onboardingStage: "complete",
    reportingMode: "demo",
    role: "owner",
  };
  const client: WorkspaceSummary = {
    id: "client",
    name: "Aclo - Al Muruj",
    onboardingStage: "complete",
    reportingMode: "client_export",
    role: "viewer",
  };
  assert.equal(chooseWorkspace([demo, client])?.id, "client");
});

test("roles enforce management and financial approval distinctions", () => {
  assert.equal(can("owner", "connections.manage"), true);
  assert.equal(can("general_manager", "financial.approve"), true);
  assert.equal(can("ecommerce_manager", "financial.approve"), false);
  assert.equal(can("operator", "availability.request"), true);
  assert.equal(can("operator", "branches.write"), false);
  assert.equal(can("viewer", "catalog.draft"), false);
});

test("branch access requires membership scope even for visible roles", () => {
  assert.equal(canAccessBranch("operator", "olaya", false, ["olaya"]), true);
  assert.equal(canAccessBranch("operator", "malqa", false, ["olaya"]), false);
  assert.equal(canAccessBranch("viewer", "malqa", true, []), true);
});

test("signup rejects malformed input and tracks onboarding state", () => {
  assert.match(validateWorkspaceInput({ ...validAccount, email: "invalid" }) ?? "", /email/);
  assert.match(
    validateWorkspaceInput({ ...validAccount, acceptedTerms: false }) ?? "",
    /development|terms/i,
  );
  assert.equal(validateWorkspaceInput(validAccount), null);
  assert.equal(nextOnboardingStage("connect"), "import");
  assert.equal(nextOnboardingStage("import"), "complete");
});

test("authentication creates workspace only after a session exists", async () => {
  let rpcCalls = 0;
  const unconfirmed = {
    auth: { signUp: async () => ({ data: { session: null }, error: null }) },
    rpc: async () => {
      rpcCalls++;
      return { error: null };
    },
  } as unknown as SupabaseClient<Database>;
  assert.deepEqual(await createWorkspaceAccountWith(unconfirmed, validAccount), {
    needsEmailConfirmation: true,
  });
  assert.equal(rpcCalls, 0);

  const confirmed = {
    auth: { signUp: async () => ({ data: { session: { access_token: "test" } }, error: null }) },
    rpc: async (name: string, args: { p_name: string }) => {
      assert.equal(name, "create_workspace");
      assert.equal(args.p_name, "Shawarma & Co.");
      rpcCalls++;
      return { error: null };
    },
  } as unknown as SupabaseClient<Database>;
  assert.deepEqual(await createWorkspaceAccountWith(confirmed, validAccount), {
    needsEmailConfirmation: false,
  });
  assert.equal(rpcCalls, 1);
});

test("HungerStation mock exposes demo branches without external write capabilities", async () => {
  const preview = await mockHungerStationAdapter.previewBusiness();
  assert.equal(preview.source, "demo");
  assert.equal(preview.branches.length, 3);
  assert.equal(new Set(preview.branches.map((branch) => branch.externalVendorId)).size, 3);
  assert.equal(mockHungerStationAdapter.capabilities.includes("price.write"), false);
  preview.branches[0]!.name = "mutated";
  const second = await mockHungerStationAdapter.previewBusiness();
  assert.notEqual(second.branches[0]!.name, "mutated");
});
