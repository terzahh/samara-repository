require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleFiles() {
    try {
        console.log('📎 Adding sample file URLs to ECE research records...\n');

        // Get ECE research records without files
        const { data: eceResearch, error } = await supabase
            .from('research')
            .select('id, title, access_level')
            .eq('department_id', '54a5cef8-0890-4908-80d2-8d9e14806c80')
            .is('file_url', null);

        if (error) throw error;

        console.log(`Found ${eceResearch.length} ECE records without files\n`);

        // Sample file data for each record
        const fileUpdates = [
            {
                title: 'Smart Grid Implementation in Rural Areas',
                file_url: 'https://example.com/sample-files/smart-grid-thesis.pdf',
                file_name: 'smart-grid-implementation-rural-areas.pdf',
                file_path: 'research/sample_smart_grid_thesis.pdf'
            },
            {
                title: 'Advanced Signal Processing for 5G Communications',
                file_url: 'https://example.com/sample-files/5g-signal-processing.pdf',
                file_name: '5g-signal-processing-dissertation.pdf',
                file_path: 'research/sample_5g_signal_processing.pdf'
            }
        ];

        // Update each record
        for (const research of eceResearch) {
            const fileData = fileUpdates.find(f => research.title.includes(f.title.split(' ')[0]));
            
            if (fileData) {
                const { error: updateError } = await supabase
                    .from('research')
                    .update({
                        file_url: fileData.file_url,
                        file_name: fileData.file_name,
                        file_path: fileData.file_path
                    })
                    .eq('id', research.id);

                if (updateError) {
                    console.error(`❌ Failed to update "${research.title}":`, updateError.message);
                } else {
                    console.log(`✅ Updated: ${research.title}`);
                    console.log(`   File: ${fileData.file_name}`);
                    console.log(`   Access: ${research.access_level}\n`);
                }
            }
        }

        // Verify the updates
        console.log('🔍 Verifying updates...\n');
        
        const { data: updatedResearch, error: verifyError } = await supabase
            .from('research')
            .select('id, title, file_url, file_name, access_level')
            .eq('department_id', '54a5cef8-0890-4908-80d2-8d9e14806c80');

        if (verifyError) throw verifyError;

        updatedResearch.forEach(r => {
            const hasFile = r.file_url && r.file_url.trim() !== '';
            console.log(`${hasFile ? '✅' : '❌'} ${r.title} (${r.access_level})`);
            if (hasFile) {
                console.log(`   File: ${r.file_name}`);
            }
            console.log('');
        });

        console.log('🎉 Sample files added successfully!');
        console.log('\nNow both ECE research records should show download buttons.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addSampleFiles();