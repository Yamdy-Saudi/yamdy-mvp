import { PGlite } from "@electric-sql/pglite";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import prettier from "prettier";

const db = new PGlite();
const bootstrap = await readFile("supabase/test-migrations/000_auth_stub.sql", "utf8");
await db.exec(bootstrap);
await db.exec("select set_config('app.isolated_test', 'on', false)");
for (const name of (await readdir("supabase/migrations"))
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  await db.exec(await readFile(`supabase/migrations/${name}`, "utf8"));
}

const columns = (
  await db.query(
    "select table_name, column_name, is_nullable, udt_name, column_default from information_schema.columns where table_schema = 'public' and table_name in (select tablename from pg_tables where schemaname = 'public') order by table_name, ordinal_position",
  )
).rows;
const enumRows = (
  await db.query(
    "select t.typname, e.enumlabel from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' order by t.typname, e.enumsortorder",
  )
).rows;
const enumNames = new Set(enumRows.map((row) => row.typname));
const typeOf = (column) =>
  enumNames.has(column.udt_name)
    ? 'Database["public"]["Enums"]["' + column.udt_name + '"]'
    : ({
        uuid: "string",
        text: "string",
        varchar: "string",
        timestamptz: "string",
        date: "string",
        bool: "boolean",
        int2: "number",
        int4: "number",
        int8: "number",
        numeric: "number",
        jsonb: "Json",
      }[column.udt_name] ?? "unknown");

const tables = [...new Set(columns.map((column) => column.table_name))];
const lines = [
  "// Generated from committed migrations by npm run gen:types.",
  "// Do not edit by hand. Generated from committed migrations.",
  "export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];",
  "export type Database = {",
  "  public: {",
  "    Tables: {",
];
for (const table of tables) {
  const fields = columns.filter((column) => column.table_name === table);
  lines.push('      "' + table + '": {', "        Row: {");
  for (const field of fields)
    lines.push(
      "          " +
        field.column_name +
        ": " +
        typeOf(field) +
        (field.is_nullable === "YES" ? " | null" : "") +
        ";",
    );
  lines.push("        };", "        Insert: {");
  for (const field of fields) {
    const optional = field.is_nullable === "YES" || field.column_default != null;
    lines.push(
      "          " +
        field.column_name +
        (optional ? "?" : "") +
        ": " +
        typeOf(field) +
        (field.is_nullable === "YES" ? " | null" : "") +
        ";",
    );
  }
  lines.push("        };", "        Update: {");
  for (const field of fields)
    lines.push(
      "          " +
        field.column_name +
        "?: " +
        typeOf(field) +
        (field.is_nullable === "YES" ? " | null" : "") +
        ";",
    );
  lines.push("        };", "        Relationships: [];", "      };");
}
lines.push("    };", "    Views: { [_ in never]: never };", "    Functions: {");
lines.push("      create_workspace: { Args: { p_name: string }; Returns: string };");
lines.push("      create_mock_connection: { Args: { p_workspace_id: string }; Returns: string };");
lines.push(
  "      bootstrap_demo_workspace: { Args: { p_workspace_id: string }; Returns: number };",
);
lines.push(
  "      demo_update_opportunity: { Args: { p_opportunity_id: string; p_action: string }; Returns: string };",
);
lines.push(
  "      demo_decide_approval: { Args: { p_approval_id: string; p_decision: string; p_reason?: string }; Returns: string };",
);
lines.push(
  "      demo_save_product_draft: { Args: { p_product_id: string; p_name_en: string; p_name_ar: string; p_description_en: string; p_price_sar: number }; Returns: string };",
);
lines.push(
  "      demo_save_draft: { Args: { p_workspace_id: string; p_kind: string; p_title: string; p_payload: Json }; Returns: string };",
);
lines.push("    };", "    Enums: {");
for (const name of enumNames) {
  const labels = enumRows
    .filter((row) => row.typname === name)
    .map((row) => JSON.stringify(row.enumlabel));
  lines.push('      "' + name + '": ' + labels.join(" | ") + ";");
}
lines.push("    };", "    CompositeTypes: { [_ in never]: never };", "  };", "};", "");
await mkdir("src/types", { recursive: true });
const typePath = "src/types/database.generated.ts";
const prettierConfig = await prettier.resolveConfig(typePath);
const output = await prettier.format(lines.join("\n"), {
  ...prettierConfig,
  filepath: typePath,
});
await writeFile("src/types/database.generated.ts", output, "utf8");
await db.close();
console.log("Generated src/types/database.generated.ts from committed migrations.");
