const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

function loadDatabaseUrlFromDotenv() {
  const envPath = path.join(process.cwd(), '.env');
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const line = lines.find((l) => l.startsWith('DATABASE_URL='));
  return line ? line.slice('DATABASE_URL='.length).trim() : null;
}

(async () => {
  const databaseUrl = process.env.DATABASE_URL || loadDatabaseUrlFromDotenv();
  if (!databaseUrl) throw new Error('DATABASE_URL not found');
  const sql = neon(databaseUrl);

  const cols = await sql`
    select column_name, data_type
    from information_schema.columns
    where table_schema='public' and table_name='users'
    order by ordinal_position;
  `;

  console.log(JSON.stringify(cols, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
