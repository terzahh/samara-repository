/*
Safe migration script: normalize_research_levels.js

- Scans the `research` table via the existing Supabase client at `src/supabase/supabase.js`.
- Uses the app's `getResearchLevel` heuristic to infer an item's level (undergraduate/postgraduate/unknown).
- For records that do NOT already include a `level:` tag in their `keywords`, this script will suggest adding `level:<inferred>`.
- By default the script runs in "preview" mode and writes `scripts/level_update_preview.json` with proposed updates.
- To actually apply changes to the DB, run with `--apply` (dangerous: recommended to backup DB first).

#!/usr/bin/env node
/**
 * normalize_research_levels.js
 *
 * Safe migration script to ensure each research row has a `level:` tag in `keywords`.
 * - Preview mode (default) writes `scripts/level_update_preview.json` with proposed updates.
 * - Apply mode (`--apply`) will update the DB (use only after review and backup).
 *
 * Heuristics (ordered):
 * 1. Title or file name contains MSc / M.Sc / Master / PhD / Doctor => postgraduate
 * 2. Type is thesis/dissertation => postgraduate
 * 3. App helper `getResearchLevel` result if available
 * 4. Default to undergraduate
 *
 * Produces a log of changes and is idempotent.
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const apply = process.argv.includes('--apply');

  // load app supabase client and helper
  const supabaseModulePath = path.join(projectRoot, 'src', 'supabase', 'supabase.js');
  if (!fs.existsSync(supabaseModulePath)) {
    console.error('Supabase client not found at', supabaseModulePath);
    process.exit(1);
  }

  const { supabase } = require(supabaseModulePath);
  const helpersPath = path.join(projectRoot, 'src', 'utils', 'helpers.js');
  const getResearchLevel = fs.existsSync(helpersPath) ? require(helpersPath).getResearchLevel : null;

  // Page through research rows
  const PAGE_SIZE = 1000;
  console.log('Fetching research rows...');

  let allRows = [];
  let page = 0;
  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('research')
      .select('id, title, keywords, type, created_at, year, file_name, department_id')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching research rows:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < PAGE_SIZE) break;
    page += 1;
  }

  console.log(`Fetched ${allRows.length} research rows.`);

  const updates = [];

  for (const r of allRows) {
    const keywords = (r.keywords || '')?.toString() || '';
    if (/level:(undergraduate|postgraduate)/i.test(keywords)) continue; // already tagged

    const title = (r.title || '').toLowerCase();
    const fileName = (r.file_name || '').toLowerCase();
    const type = (r.type || '').toLowerCase();

    let inferred = 'unknown';
    let heuristic = null;

    // 1. Title/file name heuristic
    if (/(\bmsc\b|\bm\.sc\b|\bmaster\b|\bphd\b|\bdoctor\b|\bm\.s\.c\b)/i.test(title + ' ' + fileName)) {
      inferred = 'postgraduate';
      heuristic = 'title_filename_keyword';
    }

    // 2. type-based heuristic
    if (inferred === 'unknown') {
      if (['thesis', 'dissertation'].includes(type)) {
        inferred = 'postgraduate';
        heuristic = 'type_mapping';
      }
    }

    // 3. helper inference
    if (inferred === 'unknown' && typeof getResearchLevel === 'function') {
      try {
        const helper = getResearchLevel(r);
        if (helper === 'postgraduate' || helper === 'undergraduate') {
          inferred = helper;
          heuristic = 'helper_inference';
        }
      } catch (e) {
        // ignore helper errors
      }
    }

    // 4. default to undergraduate to satisfy requirement (no Unknown shown to users)
    if (inferred === 'unknown') {
      inferred = 'undergraduate';
      heuristic = 'default_undergraduate';
    }

    const levelTag = `level:${inferred}`;
    const proposed_keywords = keywords ? `${keywords}, ${levelTag}` : levelTag;

    updates.push({ id: r.id, title: r.title, current_keywords: keywords, inferred_level: inferred, heuristic, proposed_keywords });
  }

  const previewPath = path.join(projectRoot, 'scripts', 'level_update_preview.json');
  fs.writeFileSync(previewPath, JSON.stringify({ generated_at: new Date().toISOString(), apply, count: updates.length, updates }, null, 2));
  console.log(`Preview written to ${previewPath} — ${updates.length} rows proposed for update.`);

  if (apply) {
    console.log('Applying updates...');
    const log = [];
    for (const u of updates) {
      // re-check to be idempotent
      const { data: row } = await supabase.from('research').select('keywords').eq('id', u.id).single();
      const currentKeywords = (row?.keywords || '')?.toString() || '';
      if (/level:(undergraduate|postgraduate)/i.test(currentKeywords)) {
        log.push({ id: u.id, status: 'skipped_already_tagged' });
        continue;
      }

      const { error: upErr } = await supabase.from('research').update({ keywords: u.proposed_keywords }).eq('id', u.id);
      if (upErr) {
        console.error(`Failed to update id=${u.id}:`, upErr);
        log.push({ id: u.id, status: 'error', error: upErr });
      } else {
        console.log(`Updated id=${u.id} -> ${u.inferred_level} (${u.heuristic})`);
        log.push({ id: u.id, status: 'updated', old_keywords: u.current_keywords, new_keywords: u.proposed_keywords, inferred: u.inferred_level, heuristic: u.heuristic });
      }
    }
    const logPath = path.join(projectRoot, 'scripts', 'level_update_log.json');
    fs.writeFileSync(logPath, JSON.stringify({ applied_at: new Date().toISOString(), log }, null, 2));
    console.log(`Apply complete — log written to ${logPath}`);
  } else {
    console.log('Preview complete. Run with --apply to apply changes (backup DB before applying).');
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
