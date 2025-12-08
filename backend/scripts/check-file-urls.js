require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFileUrls() {
    try {
        console.log('🔍 Checking file URLs for all research records...\n');

        // Get all research records
        const { data: research, error } = await supabase
            .from('research')
            .select('id, title, file_url, file_name, file_path, access_level')
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`Found ${research.length} research records\n`);

        let withFiles = 0;
        let withoutFiles = 0;

        research.forEach(r => {
            const hasFile = r.file_url && r.file_url.trim() !== '';
            if (hasFile) {
                withFiles++;
                console.log(`✅ ${r.title} (${r.access_level})`);
                console.log(`   File: ${r.file_name || 'No filename'}`);
                console.log(`   URL: ${r.file_url.substring(0, 50)}...`);
            } else {
                withoutFiles++;
                console.log(`❌ ${r.title} (${r.access_level}) - NO FILE`);
            }
            console.log('');
        });

        console.log('📊 Summary:');
        console.log(`   Records with files: ${withFiles}`);
        console.log(`   Records without files: ${withoutFiles}`);
        console.log(`   Total records: ${research.length}`);

        if (withoutFiles > 0) {
            console.log('\n⚠️  Some research records are missing file URLs.');
            console.log('   This is why download buttons may not appear for some records.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkFileUrls();