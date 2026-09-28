import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const ownerA = "10000000-0000-4000-8000-000000000001";
const ownerB = "10000000-0000-4000-8000-000000000002";
const restrictedOperator = "10000000-0000-4000-8000-000000000003";

async function asUser(db: PGlite, userId: string) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId]);
}

test("demo workflow preserves tenant boundaries and never claims live publication", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile("supabase/test-migrations/000_auth_stub.sql", "utf8"));
    await db.exec("select set_config('app.isolated_test', 'on', false)");
    for (const name of (await readdir("supabase/migrations"))
      .filter((item) => item.endsWith(".sql"))
      .sort()) {
      await db.exec(await readFile(`supabase/migrations/${name}`, "utf8"));
    }
    await db.query("insert into auth.users(id) values ($1),($2),($3)", [
      ownerA,
      ownerB,
      restrictedOperator,
    ]);
    await asUser(db, ownerA);
    const workspaceA = (
      await db.query<{ id: string }>("select public.create_workspace('Demo A') as id")
    ).rows[0]!.id;
    const brandA = (
      await db.query<{ id: string }>(
        "insert into public.brands(workspace_id,name,is_demo) values ($1,'Demo Brand',true) returning id",
        [workspaceA],
      )
    ).rows[0]!.id;
    const branchA = (
      await db.query<{ id: string }>(
        "insert into public.branches(workspace_id,brand_id,code,name,is_demo) values ($1,$2,'olaya','Olaya',true) returning id",
        [workspaceA, brandA],
      )
    ).rows[0]!.id;
    await db.query("select public.create_mock_connection($1)", [workspaceA]);
    assert.equal(
      (
        await db.query<{ count: number }>("select public.bootstrap_demo_workspace($1) as count", [
          workspaceA,
        ])
      ).rows[0]!.count,
      6,
    );
    await db.query("select public.bootstrap_demo_workspace($1)", [workspaceA]);
    assert.equal((await db.query("select id from public.catalog_products")).rows.length, 6);
    assert.equal((await db.query("select id from public.opportunities")).rows.length, 5);
    assert.equal((await db.query("select day from public.performance_daily")).rows.length, 28);
    const approvalA = (
      await db.query<{ id: string }>(
        "select id from public.approval_requests where workspace_id=$1",
        [workspaceA],
      )
    ).rows[0]!.id;
    const productA = (
      await db.query<{ id: string }>(
        "select id from public.catalog_products where sku='DEMO-BURGER'",
      )
    ).rows[0]!.id;
    await db.query(
      "select public.demo_save_product_draft($1,'Classic Burger Plus','برجر كلاسيك','Demo copy',39)",
      [productA],
    );
    assert.equal(
      (
        await db.query<{ name_en: string }>(
          "select name_en from public.catalog_products where id=$1",
          [productA],
        )
      ).rows[0]!.name_en,
      "Classic Burger Plus",
    );
    await db.query(
      "select public.demo_save_draft($1,'campaign','Lunch Test','{" +
        '"budget_sar":100' +
        "}'::jsonb)",
      [workspaceA],
    );

    await asUser(db, ownerB);
    const workspaceB = (
      await db.query<{ id: string }>("select public.create_workspace('Demo B') as id")
    ).rows[0]!.id;
    assert.notEqual(workspaceA, workspaceB);
    assert.equal((await db.query("select id from public.catalog_products")).rows.length, 0);
    assert.equal((await db.query("select id from public.approval_requests")).rows.length, 0);
    assert.equal((await db.query("select day from public.performance_daily")).rows.length, 0);
    await assert.rejects(
      () => db.query("select public.bootstrap_demo_workspace($1)", [workspaceA]),
      /permission required/i,
    );
    await assert.rejects(
      () =>
        db.query("select public.demo_decide_approval($1,'approved','Cross-tenant')", [approvalA]),
      /access denied/i,
    );
    await assert.rejects(
      () => db.query("select public.demo_save_product_draft($1,'Intrusion','','',1)", [productA]),
      /permission required/i,
    );

    await asUser(db, ownerA);
    assert.equal(
      (
        await db.query<{ result: string }>(
          "select public.demo_decide_approval($1,'approved','Demo review') as result",
          [approvalA],
        )
      ).rows[0]!.result,
      "approved",
    );
    const execution = (
      await db.query<{ status: string; external_confirmation: string; explanation: string }>(
        "select status,external_confirmation,explanation from public.demo_executions",
      )
    ).rows[0]!;
    assert.equal(execution.status, "simulated");
    assert.equal(execution.external_confirmation, "not_confirmed");
    assert.match(execution.explanation, /no channel request/i);
    await assert.rejects(
      () => db.query("select public.demo_decide_approval($1,'approved','Again')", [approvalA]),
      /already decided/i,
    );
    assert.equal((await db.query("select id from public.demo_audit_events")).rows.length, 3);
    const otherBranch = (
      await db.query<{ id: string }>(
        "insert into public.branches(workspace_id,brand_id,code,name,is_demo) values ($1,$2,'other','Other',true) returning id",
        [workspaceA, brandA],
      )
    ).rows[0]!.id;
    await db.exec("reset role");
    const membership = (
      await db.query<{ id: string }>(
        "insert into public.workspace_memberships(workspace_id,user_id,role,scope_all_branches) values ($1,$2,'operator',false) returning id",
        [workspaceA, restrictedOperator],
      )
    ).rows[0]!.id;
    await db.query(
      "insert into public.membership_branch_access(workspace_id,membership_id,branch_id) values ($1,$2,$3)",
      [workspaceA, membership, otherBranch],
    );
    await asUser(db, restrictedOperator);
    assert.equal((await db.query("select id from public.approval_requests")).rows.length, 0);
    assert.equal((await db.query("select id from public.demo_audit_events")).rows.length, 2);
    assert.ok(branchA);
  } finally {
    await db.close();
  }
});
