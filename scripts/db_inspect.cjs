const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

function loadDatabaseUrlFromDotenv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('No .env found in project root');
  }
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const line = lines.find((l) => l.startsWith('DATABASE_URL='));
  if (!line) {
    throw new Error('DATABASE_URL not found in .env');
  }
  return line.slice('DATABASE_URL='.length).trim();
}

(async () => {
  const databaseUrl = process.env.DATABASE_URL || loadDatabaseUrlFromDotenv();
  const sql = neon(databaseUrl);

  const tables = await sql`select table_name from information_schema.tables where table_schema='public' order by table_name`;
  const sequences = await sql`select sequence_name from information_schema.sequences where sequence_schema='public' order by sequence_name`;
  const [regclass] = await sql`select to_regclass('public."enrollCourse"') as "enrollCourse", to_regclass('public.enrollcourse') as enrollcourse, to_regclass('public.courses') as courses, to_regclass('public.users') as users`;

  console.log(
    JSON.stringify(
      {
        tables: tables.map((r) => r.table_name),
        sequences: sequences.map((r) => r.sequence_name),
        regclass,
      },
      null,
      2
    )
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
