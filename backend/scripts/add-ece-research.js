require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addECEResearch() {
    try {
        console.log('📝 Adding research records to Electrical & Computer Engineering department...\n');

        // Get the correct ECE department ID
        const { data: eceDept, error: deptError } = await supabase
            .from('departments')
            .select('id, name')
            .eq('name', 'Electrical & Computer Engineering')
            .single();

        if (deptError) throw deptError;

        console.log(`✅ Found department: ${eceDept.name} (ID: ${eceDept.id})`);

        // Sample research records for ECE department
        const researchRecords = [
            {
                title: 'Smart Grid Implementation in Rural Areas',
                author: 'Dr. Ahmed Hassan',
                abstract: 'This research explores the implementation of smart grid technology in rural Ethiopian communities, focusing on renewable energy integration and grid stability. The study examines the challenges and opportunities of deploying smart grid infrastructure in areas with limited existing electrical infrastructure.',
                keywords: 'smart grid, renewable energy, rural electrification, Ethiopia, power systems, level:undergraduate',
                type: 'thesis',
                year: 2024,
                department_id: eceDept.id,
                access_level: 'public',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                title: 'Advanced Signal Processing for 5G Communications',
                author: 'Eng. Fatima Mohammed',
                abstract: 'An in-depth study of signal processing techniques for 5G wireless communication systems, with emphasis on MIMO and beamforming technologies. This research investigates advanced algorithms for improving spectral efficiency and reducing interference in next-generation wireless networks.',
                keywords: '5G, signal processing, MIMO, beamforming, wireless communication, telecommunications, level:postgraduate',
                type: 'dissertation',
                year: 2024,
                department_id: eceDept.id,
                access_level: 'restricted',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        console.log(`\n📊 Adding ${researchRecords.length} research records...\n`);

        // Insert research records
        let successCount = 0;
        for (const research of researchRecords) {
            try {
                const { data, error } = await supabase
                    .from('research')
                    .insert(research)
                    .select()
                    .single();

                if (error) {
                    console.error(`❌ Failed to insert "${research.title}":`, error.message);
                } else {
                    console.log(`✅ Added: ${research.title}`);
                    console.log(`   - Author: ${research.author}`);
                    console.log(`   - Type: ${research.type}`);
                    console.log(`   - Access: ${research.access_level}`);
                    console.log(`   - Year: ${research.year}\n`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error inserting "${research.title}":`, err.message);
            }
        }

        // Verify the records were added
        console.log('🔍 Verifying records were added...\n');

        const { data: verifyRecords, error: verifyError } = await supabase
            .from('research')
            .select('id, title, access_level, type')
            .eq('department_id', eceDept.id);

        if (verifyError) throw verifyError;

        console.log(`✅ Verification complete: Found ${verifyRecords.length} records for ECE department`);
        verifyRecords.forEach(record => {
            console.log(`   - ${record.title} (${record.access_level}, ${record.type})`);
        });

        console.log('\n🎉 ECE research records added successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Department: ${eceDept.name}`);
        console.log(`   - Department ID: ${eceDept.id}`);
        console.log(`   - Records added: ${successCount}`);
        console.log(`   - Total records: ${verifyRecords.length}`);
        console.log(`   - Public records: ${verifyRecords.filter(r => r.access_level === 'public').length}`);
        console.log(`   - Restricted records: ${verifyRecords.filter(r => r.access_level === 'restricted').length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addECEResearch();