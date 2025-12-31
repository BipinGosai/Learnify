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

  // Ensure courses.cid is unique (required for a foreign key reference)
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_cid_unique') THEN
        ALTER TABLE "courses" ADD CONSTRAINT "courses_cid_unique" UNIQUE ("cid");
      END IF;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "enrollCourse" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "cid" varchar,
      "userEmail" varchar NOT NULL,
      "completedChapters" json
    );
  `;

  // Add foreign keys (only if missing)
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollCourse_cid_courses_cid_fk') THEN
        ALTER TABLE "enrollCourse"
          ADD CONSTRAINT "enrollCourse_cid_courses_cid_fk"
          FOREIGN KEY ("cid") REFERENCES "public"."courses"("cid")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollCourse_userEmail_users_email_fk') THEN
        ALTER TABLE "enrollCourse"
          ADD CONSTRAINT "enrollCourse_userEmail_users_email_fk"
          FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
      END IF;
    END $$;
  `;

  console.log('OK: ensured public."enrollCourse" exists');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
