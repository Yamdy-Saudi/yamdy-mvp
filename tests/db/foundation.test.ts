import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const ownerA = "00000000-0000-4000-8000-000000000001";
const ownerB = "00000000-0000-4000-8000-000000000002";
const operator = "00000000-0000-4000-8000-000000000003";

async function asUser(db: PGlite, userId: string | null) {
  await db.exec(userId ? "set role authenticated" : "set role anon");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
}

async function admin(db: PGlite) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', '', false)");
}

test("foundation migration enforces tenant, role, branch and connection boundaries", async () => {
  const db = new PGlite();
  try {
    const bootstrap = await readFile("supabase/test-migrations/000_auth_stub.sql", "utf8");
    await db.exec(bootstrap);
    await db.exec("select set_config('app.isolated_test', 'on', false)");
    for (const name of (await readdir("supabase/migrations"))
      .filter((name) => name.endsWith(".sql"))
      .sort()) {
      await db.exec(await readFile(`supabase/migrations/${name}`, "utf8"));
    }

    await db.query(
      'insert into auth.users(id, raw_user_meta_data) values ($1, \'{"full_name":"Owner A"}\'::jsonb), ($2, \'{"full_name":"Owner B"}\'::jsonb), ($3, \'{"full_name":"Operator"}\'::jsonb)',
      [ownerA, ownerB, operator],
    );
    const profiles = await db.query<{ full_name: string }>(
      "select full_name from public.profiles order by full_name",
    );
    assert.deepEqual(
      profiles.rows.map((row) => row.full_name),
      ["Operator", "Owner A", "Owner B"],
    );

    await asUser(db, null);
    await assert.rejects(
      () => db.query("select public.create_workspace('Forbidden')"),
      /permission denied|Authentication required/i,
    );

    await asUser(db, ownerA);
    const first = await db.query<{ create_workspace: string }>(
      "select public.create_workspace('Restaurant A')",
    );
    const workspaceA = first.rows[0]!.create_workspace;
    const brand = await db.query<{ id: string }>(
      "insert into public.brands(workspace_id,name,is_demo) values ($1,'Brand A',true) returning id",
      [workspaceA],
    );
    const brandId = brand.rows[0]!.id;
    const branchOne = await db.query<{ id: string }>(
      "insert into public.branches(workspace_id,brand_id,code,name,is_demo) values ($1,$2,'a-one','A One',true) returning id",
      [workspaceA, brandId],
    );
    const branchTwo = await db.query<{ id: string }>(
      "insert into public.branches(workspace_id,brand_id,code,name,is_demo) values ($1,$2,'a-two','A Two',true) returning id",
      [workspaceA, brandId],
    );
    const connectionA = (
      await db.query<{ create_mock_connection: string }>(
        "select public.create_mock_connection($1)",
        [workspaceA],
      )
    ).rows[0]!.create_mock_connection;
    await db.query(
      "insert into public.aggregator_branch_links(workspace_id,connection_id,branch_id,external_vendor_id,is_demo) values ($1,$2,$3,'demo-a-one',true)",
      [workspaceA, connectionA, branchOne.rows[0]!.id],
    );

    await asUser(db, ownerB);
    const second = await db.query<{ create_workspace: string }>(
      "select public.create_workspace('Restaurant B')",
    );
    const workspaceB = second.rows[0]!.create_workspace;
    const visibleWorkspaces = await db.query<{ id: string }>("select id from public.workspaces");
    assert.deepEqual(
      visibleWorkspaces.rows.map((row) => row.id),
      [workspaceB],
    );
    assert.equal((await db.query("select id from public.branches")).rows.length, 0);
    assert.equal((await db.query("select id from public.aggregator_connections")).rows.length, 0);
    await assert.rejects(
      () =>
        db.query("insert into public.brands(workspace_id,name) values ($1,'Intrusion')", [
          workspaceA,
        ]),
      /row-level security|permission denied/i,
    );
    await assert.rejects(
      () => db.query("select public.create_mock_connection($1)", [workspaceA]),
      /Only an owner|permission denied/i,
    );
    await assert.rejects(
      () =>
        db.query(
          "insert into public.branches(workspace_id,brand_id,code,name) values ($1,$2,'bad','Bad Branch')",
          [workspaceB, brandId],
        ),
      /foreign key|row-level security/i,
    );

    await admin(db);
    const member = await db.query<{ id: string }>(
      "insert into public.workspace_memberships(workspace_id,user_id,role,scope_all_branches) values ($1,$2,'operator',false) returning id",
      [workspaceA, operator],
    );
    await db.query(
      "insert into public.membership_branch_access(workspace_id,membership_id,branch_id) values ($1,$2,$3)",
      [workspaceA, member.rows[0]!.id, branchOne.rows[0]!.id],
    );
    await asUser(db, operator);
    const visibleBranches = await db.query<{ id: string }>(
      "select id from public.branches order by code",
    );
    assert.deepEqual(
      visibleBranches.rows.map((row) => row.id),
      [branchOne.rows[0]!.id],
    );
    assert.equal((await db.query("select id from public.aggregator_branch_links")).rows.length, 1);
    await assert.rejects(
      () =>
        db.query("insert into public.brands(workspace_id,name) values ($1,'Operator Brand')", [
          workspaceA,
        ]),
      /row-level security|permission denied/i,
    );
    await assert.rejects(
      () => db.query("select public.create_mock_connection($1)", [workspaceA]),
      /Only an owner|permission denied/i,
    );

    await admin(db);
    await db.query(
      "update public.workspace_memberships set status='suspended' where user_id=$1 and workspace_id=$2",
      [operator, workspaceA],
    );
    await asUser(db, operator);
    assert.equal((await db.query("select id from public.workspaces")).rows.length, 0);
    assert.equal((await db.query("select id from public.branches")).rows.length, 0);
    assert.equal((await db.query("select id from public.aggregator_connections")).rows.length, 0);
    assert.notEqual(branchOne.rows[0]!.id, branchTwo.rows[0]!.id);

    await admin(db);
    const seed = await readFile(
      "supabase/development-migrations/20260926164636_development_seed.sql",
      "utf8",
    );
    await db.exec(seed);
    assert.equal((await db.query("select id from public.workspaces")).rows.length, 4);
    assert.equal((await db.query("select id from public.branches")).rows.length, 6);
  } finally {
    await db.close();
  }
});
