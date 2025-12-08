normalize_research_levels.js

Purpose
-------
This script helps normalize historical `research` records by ensuring each record has a `level:` keyword tag (e.g., `level:undergraduate` or `level:postgraduate`) in the `keywords` field, which the app uses for accurate filtering.

How it works
------------
- It fetches up to 2000 research rows (adjustable in the script).
- For rows missing a `level:` tag, it infers a level using the app's `getResearchLevel` helper.
- It writes a preview file at `scripts/level_update_preview.json` showing proposed updates.
- If run with `--apply` it will update the `keywords` column for those records in the database.

Safety
------
- ALWAYS run in preview mode first (no `--apply`). Review `scripts/level_update_preview.json` carefully.
- Backup your database before running with `--apply`.
- The script updates `keywords` only for records where the helper can infer a level (skips `unknown`).

Usage
-----
# Preview only
node scripts/normalize_research_levels.js

# Apply (dangerous - backup first)
node scripts/normalize_research_levels.js --apply

Requirements
------------
- Node.js environment with access to the same environment variables your app uses for Supabase (e.g., `SUPABASE_URL`, `SUPABASE_KEY`).
- Run the script from the project root so `require` paths resolve correctly.

Notes
-----
- The script uses the existing Supabase client at `src/supabase/supabase.js` and the helper at `src/utils/helpers.js` to keep logic consistent.
- If you need broader scanning (more than 2000 rows), increase PAGE_SIZE in the script or implement pagination.
- If you prefer a dry-run CSV instead of JSON, I can add that.
