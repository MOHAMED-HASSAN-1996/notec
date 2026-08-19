const { Pool } = require("pg");
async function main() {
  const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  });
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