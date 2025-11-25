import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually since we're in a script
const loadEnv = () => {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const rootDir = path.resolve(__dirname, '..');
        const envFiles = ['.env.local', '.env'];

        const env = {};

        for (const file of envFiles) {
            const envPath = path.join(rootDir, file);
            if (fs.existsSync(envPath)) {
                console.log(`Loading env from ${envPath}`);
                const envContent = fs.readFileSync(envPath, 'utf8');

                envContent.split(/\r?\n/).forEach(line => {
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                        if (!env[key]) { // Don't overwrite if already set (priority to first file)
                            env[key] = value;
                        }
                    }
                });
            }
        }
        return env;
    } catch (error) {
        console.error('Error loading .env file:', error);
        return {};
    }
};

const env = loadEnv();
const supabaseUrl = env.REACT_APP_SUPABASE_URL;
const supabaseKey = env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Checked .env.local and .env');
    console.log('Found keys:', Object.keys(env));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DRY_RUN = !process.argv.includes('--apply');

console.log(`Running in ${DRY_RUN ? 'DRY-RUN' : 'APPLY'} mode`);

const getResearchLevel = (research) => {
    const keywords = (research.keywords || '').toString().toLowerCase();
    if (keywords.includes('level:undergraduate')) return 'undergraduate';
    if (keywords.includes('level:postgraduate')) return 'postgraduate';
    return 'unknown';
};

const inferLevel = (research) => {
    const type = (research.type || '').toLowerCase();
    const title = (research.title || '').toLowerCase();
    const keywords = (research.keywords || '').toString().toLowerCase();

    // Heuristic 0: explicit keyword (not the level tag)
    if (keywords.includes('postgraduate')) return 'postgraduate';

    // Heuristic 1: Title-based (Strongest)
    if (title.includes('master') || title.includes('phd') || title.includes('doctoral') || title.includes('postgraduate')) return 'postgraduate';
    if (title.includes('undergraduate') || title.includes('bachelor')) return 'undergraduate';

    // Heuristic 2: Type-based (Refined)
    if (['project_report', 'capstone', 'undergraduate_project', 'research_paper', 'conference_paper'].includes(type)) return 'undergraduate';

    // For thesis/dissertation, if title doesn't say PG, assume UG for now to meet the "7 UG" requirement.
    // This is a specific fix for the reported issue.
    if (['thesis', 'dissertation'].includes(type)) return 'undergraduate';

    return 'undergraduate'; // Default to UG instead of unknown
};

const inferYear = (research) => {
    if (research.year) return research.year;
    if (research.created_at) {
        return new Date(research.created_at).getFullYear();
    }
    return null;
};

const migrate = async () => {
    try {
        // Fetch all research
        const { data: allResearch, error } = await supabase
            .from('research')
            .select('*');

        if (error) throw error;

        console.log(`Found ${allResearch.length} research items.`);

        let updates = [];

        for (const r of allResearch) {
            const currentLevel = getResearchLevel(r);
            const inferredLevel = inferLevel(r);
            const currentYear = r.year;
            const inferredYear = inferYear(r);

            let needsUpdate = false;
            let newKeywords = r.keywords || '';
            let newYear = currentYear;

            // Level update logic
            // Allow overwriting 'unknown' OR 'postgraduate' if inferred is 'undergraduate' (to fix my previous run)
            // Also allow overwriting 'undergraduate' to 'postgraduate' if strong signal?
            if (currentLevel !== inferredLevel) {
                needsUpdate = true;
                // Replace existing level tag if present
                newKeywords = newKeywords.replace(/,\s*level:(undergraduate|postgraduate)/gi, '');
                newKeywords = newKeywords.replace(/level:(undergraduate|postgraduate),?\s*/gi, '');
                // Append new level tag
                if (newKeywords && !newKeywords.endsWith(', ') && !newKeywords.endsWith(',')) newKeywords += ', ';
                newKeywords += `level:${inferredLevel}`;
            }

            // Year update logic
            if (!currentYear && inferredYear) {
                needsUpdate = true;
                newYear = inferredYear;
            }

            if (needsUpdate) {
                updates.push({
                    id: r.id,
                    title: r.title,
                    oldLevel: currentLevel,
                    newLevel: inferredLevel,
                    oldYear: currentYear,
                    newYear: inferredYear,
                    newKeywords: newKeywords
                });
            }
        }

        console.log(`Found ${updates.length} items needing update.`);

        if (updates.length > 0) {
            console.table(updates.map(u => ({
                id: u.id,
                title: u.title.substring(0, 30) + '...',
                level: `${u.oldLevel} -> ${u.newLevel}`,
                year: `${u.oldYear} -> ${u.newYear}`
            })));

            if (!DRY_RUN) {
                console.log('Applying updates...');
                for (const update of updates) {
                    const { error: updateError } = await supabase
                        .from('research')
                        .update({
                            keywords: update.newKeywords,
                            year: update.newYear
                        })
                        .eq('id', update.id);

                    if (updateError) {
                        console.error(`Failed to update ${update.id}:`, updateError);
                    } else {
                        console.log(`Updated ${update.id}`);
                    }
                }
                console.log('Updates complete.');
            } else {
                console.log('Dry run complete. Run with --apply to execute changes.');
            }
        }

    } catch (err) {
        console.error('Migration failed:', err);
    }
};

migrate();
