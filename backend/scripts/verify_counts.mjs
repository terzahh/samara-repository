import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually
const loadEnv = () => {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const rootDir = path.resolve(__dirname, '..');
        const envFiles = ['.env.local', '.env'];

        const env = {};

        for (const file of envFiles) {
            const envPath = path.join(rootDir, file);
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                envContent.split(/\r?\n/).forEach(line => {
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                        if (!env[key]) env[key] = value;
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
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const getResearchLevel = (research) => {
    const keywords = (research.keywords || '').toString().toLowerCase();
    if (keywords.includes('level:undergraduate')) return 'undergraduate';
    if (keywords.includes('level:postgraduate')) return 'postgraduate';
    return 'unknown';
};

const verify = async () => {
    try {
        // 1. Find Computer Science department
        const { data: depts, error: deptError } = await supabase
            .from('departments')
            .select('id, name')
            .ilike('name', '%Computer Science%');

        if (deptError) throw deptError;

        if (depts.length === 0) {
            console.error('Computer Science department not found');
            return;
        }

        const csDept = depts[0];
        console.log(`Checking Department: ${csDept.name} (ID: ${csDept.id})`);

        // 2. Fetch research for this department
        const { data: research, error: resError } = await supabase
            .from('research')
            .select('*')
            .eq('department_id', csDept.id);

        if (resError) throw resError;

        // 3. Count levels
        const counts = research.reduce((acc, r) => {
            const lvl = getResearchLevel(r);
            acc[lvl] = (acc[lvl] || 0) + 1;
            acc.total = (acc.total || 0) + 1;
            return acc;
        }, { total: 0, undergraduate: 0, postgraduate: 0, unknown: 0 });

        console.log('Counts:', counts);

        // 4. Verify against requirements
        // "8 files — 7 Undergraduate, 1 Postgraduate"
        const expected = { total: 8, undergraduate: 7, postgraduate: 1, unknown: 0 };

        let passed = true;
        if (counts.total !== expected.total) {
            console.error(`FAIL: Total count mismatch. Expected ${expected.total}, got ${counts.total}`);
            passed = false;
        }
        if (counts.undergraduate !== expected.undergraduate) {
            console.error(`FAIL: Undergraduate count mismatch. Expected ${expected.undergraduate}, got ${counts.undergraduate}`);
            passed = false;
        }
        if (counts.postgraduate !== expected.postgraduate) {
            console.error(`FAIL: Postgraduate count mismatch. Expected ${expected.postgraduate}, got ${counts.postgraduate}`);
            passed = false;
        }
        if (counts.unknown !== expected.unknown) {
            console.error(`FAIL: Unknown count mismatch. Expected ${expected.unknown}, got ${counts.unknown}`);
            passed = false;
        }

        if (passed) {
            console.log('SUCCESS: Counts match expected values.');
        } else {
            console.log('Verification FAILED.');
            process.exit(1);
        }

    } catch (err) {
        console.error('Verification error:', err);
        process.exit(1);
    }
};

verify();
