require("dotenv").config?.();
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
const { pool } = require("./src/db");

async function main() {
  const r = await pool.query("select id, title, city from events order by id");
  console.log("EVENTS:", JSON.stringify(r.rows, null, 2));
  const t = await pool.query(
    "select tablename from pg_tables where schemaname='public'",
  );
  console.log("TABLES:", t.rows.map((x) => x.tablename).join(", "));
  await pool.end();
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});