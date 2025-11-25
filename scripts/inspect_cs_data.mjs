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

const inspect = async () => {
    try {
        const { data: depts } = await supabase
            .from('departments')
            .select('id, name')
            .ilike('name', '%Computer Science%');

        if (!depts.length) {
            console.log('CS Dept not found');
            return;
        }

        const csId = depts[0].id;
        console.log(`CS Dept ID: ${csId}`);

        const { data: research } = await supabase
            .from('research')
            .select('id, title, type, keywords')
            .eq('department_id', csId);

        console.log(JSON.stringify(research.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            keywords: r.keywords
        })), null, 2));

    } catch (err) {
        console.error(err);
    }
};

inspect();
