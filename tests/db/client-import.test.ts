import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const owner = "20000000-0000-4000-8000-000000000001";
const other = "20000000-0000-4000-8000-000000000002";

async function asUser(db: PGlite, id: string) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}

test("client aggregate backfill preserves demo history and tenant isolation", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile("supabase/test-migrations/000_auth_stub.sql", "utf8"));
    await db.exec("select set_config('app.isolated_test', 'on', false)");
    for (const name of (await readdir("supabase/migrations"))
      .filter((item) => item.endsWith(".sql"))
      .sort()) {
      await db.exec(await readFile(`supabase/migrations/${name}`, "utf8"));
    }
    await db.query("insert into auth.users(id) values ($1),($2)", [owner, other]);
    await asUser(db, owner);
    const workspace = (
      await db.query<{ id: string }>("select public.create_workspace('Current Demo') as id")
    ).rows[0]!.id;
    const brand = (
      await db.query<{ id: string }>(
        "insert into public.brands(workspace_id,name,is_demo) values ($1,'Sample Brand',true) returning id",
        [workspace],
      )
    ).rows[0]!.id;
    await db.query(
      "insert into public.branches(workspace_id,brand_id,code,name,is_demo) values ($1,$2,'demo-olaya','Sample Branch',true)",
      [workspace, brand],
    );
    await db.query("select public.create_mock_connection($1)", [workspace]);
    await db.query("select public.bootstrap_demo_workspace($1)", [workspace]);
    await db.exec("reset role");
    await db.query(
      "update public.workspaces set name='Aclo', created_at='2026-09-27 17:10:08.516764+00' where id=$1",
      [workspace],
    );
    await db.exec(
      await readFile("supabase/migrations/20260928165804_aclo_order_backfill.sql", "utf8"),
    );
    await db.query("update auth.users set email='ahmad.agha@yamdy.net' where id=$1", [other]);
    await db.exec(
      await readFile("supabase/migrations/20260928170753_grant_aclo_report_access.sql", "utf8"),
    );

    await asUser(db, owner);
    const summary = (
      await db.query<{
        days: number;
        orders: number;
        delivered: number;
        cancelled: number;
        gross: string;
        payout: string;
      }>(
        `select count(*)::int days,
          sum(delivered_orders + cancelled_orders)::int orders,
          sum(delivered_orders)::int delivered,
          sum(cancelled_orders)::int cancelled,
          sum(gross_sales_sar)::text gross,
          sum(reported_payout_sar)::text payout
        from public.order_performance_daily`,
      )
    ).rows[0]!;
    assert.equal(summary.days, 211);
    assert.equal(summary.orders, 582);
    assert.equal(summary.delivered, 577);
    assert.equal(summary.cancelled, 5);
    assert.equal(Number(summary.gross), 62296);
    assert.equal(Number(summary.payout), 27437.84);
    assert.equal((await db.query("select id from public.order_import_batches")).rows.length, 1);
    const grants = (
      await db.query<{
        anon_select: boolean;
        auth_select: boolean;
        auth_insert: boolean;
        auth_update: boolean;
        auth_delete: boolean;
      }>(
        `select has_table_privilege('anon', 'public.order_performance_daily', 'select') anon_select,
          has_table_privilege('authenticated', 'public.order_performance_daily', 'select') auth_select,
          has_table_privilege('authenticated', 'public.order_performance_daily', 'insert') auth_insert,
          has_table_privilege('authenticated', 'public.order_performance_daily', 'update') auth_update,
          has_table_privilege('authenticated', 'public.order_performance_daily', 'delete') auth_delete`,
      )
    ).rows[0]!;
    assert.deepEqual(grants, {
      anon_select: false,
      auth_select: true,
      auth_insert: false,
      auth_update: false,
      auth_delete: false,
    });
    assert.equal(
      (await db.query("select id from public.branches where archived_at is null")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select id from public.branches where archived_at is not null")).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query<{ count: number }>("select public.bootstrap_demo_workspace($1) as count", [
          workspace,
        ])
      ).rows[0]!.count,
      0,
    );
    assert.equal((await db.query("select id from public.opportunities")).rows.length, 5);
    await asUser(db, other);
    assert.equal(
      (await db.query("select day from public.order_performance_daily")).rows.length,
      211,
    );
    assert.equal((await db.query("select id from public.order_import_batches")).rows.length, 1);
    await db.exec("reset role");
    const restrictedMembership = (
      await db.query<{ id: string }>(
        "update public.workspace_memberships set scope_all_branches=false where workspace_id=$1 and user_id=$2 returning id",
        [workspace, other],
      )
    ).rows[0]!.id;
    const realBranch = (
      await db.query<{ id: string }>(
        "select id from public.branches where workspace_id=$1 and is_demo=false",
        [workspace],
      )
    ).rows[0]!.id;
    await asUser(db, other);
    assert.equal((await db.query("select day from public.order_performance_daily")).rows.length, 0);
    await db.exec("reset role");
    await db.query(
      "insert into public.membership_branch_access(workspace_id,membership_id,branch_id) values ($1,$2,$3)",
      [workspace, restrictedMembership, realBranch],
    );
    await asUser(db, other);
    assert.equal(
      (await db.query("select day from public.order_performance_daily")).rows.length,
      211,
    );
  } finally {
    await db.close();
  }
});
