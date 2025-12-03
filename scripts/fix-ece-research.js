require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixECEResearch() {
    try {
        console.log('🔍 Checking Electrical & Computer Engineering department...\n');

        // 1. Check if ECE department exists
        const { data: eceDepts, error: deptError } = await supabase
            .from('departments')
            .select('id, name')
            .or('name.ilike.%Electrical%,name.ilike.%Computer Engineering%');

        if (deptError) throw deptError;

        console.log('Found departments:', eceDepts);

        let eceDeptId = null;

        // Find or create ECE department
        if (eceDepts.length === 0) {
            console.log('❌ Electrical & Computer Engineering department not found. Creating...');
            
            const { data: newDept, error: insertError } = await supabase
                .from('departments')
                .insert({ name: 'Electrical & Computer Engineering' })
                .select()
                .single();

            if (insertError) throw insertError;
            
            eceDeptId = newDept.id;
            console.log(`✅ Created department: ${newDept.name} (ID: ${eceDeptId})`);
        } else {
            eceDeptId = eceDepts[0].id;
            console.log(`✅ Found department: ${eceDepts[0].name} (ID: ${eceDeptId})`);
        }

        // 2. Check existing research for ECE department
        const { data: existingResearch, error: resError } = await supabase
            .from('research')
            .select('*')
            .eq('department_id', eceDeptId);

        if (resError) throw resError;

        console.log(`\n📊 Found ${existingResearch.length} existing research records for ECE`);

        if (existingResearch.length >= 2) {
            console.log('✅ Department already has research records. Checking access levels...');
            
            const publicCount = existingResearch.filter(r => r.access_level === 'public').length;
            const restrictedCount = existingResearch.filter(r => r.access_level === 'restricted').length;
            
            console.log(`   - Public: ${publicCount}`);
            console.log(`   - Restricted: ${restrictedCount}`);
            
            if (publicCount >= 1 && restrictedCount >= 1) {
                console.log('✅ Both public and restricted research exist. Issue might be elsewhere.');
                return;
            }
        }

        // 3. Create sample research records if needed
        console.log('\n📝 Creating sample research records...');

        const sampleResearch = [
            {
                title: 'Smart Grid Implementation in Rural Areas',
                author: 'Dr. Ahmed Hassan',
                abstract: 'This research explores the implementation of smart grid technology in rural Ethiopian communities, focusing on renewable energy integration and grid stability.',
                keywords: 'smart grid, renewable energy, rural electrification, Ethiopia, level:undergraduate',
                type: 'thesis',
                year: 2024,
                department_id: eceDeptId,
                access_level: 'public',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                title: 'Advanced Signal Processing for 5G Communications',
                author: 'Eng. Fatima Mohammed',
                abstract: 'An in-depth study of signal processing techniques for 5G wireless communication systems, with emphasis on MIMO and beamforming technologies.',
                keywords: '5G, signal processing, MIMO, beamforming, wireless communication, level:postgraduate',
                type: 'dissertation',
                year: 2024,
                department_id: eceDeptId,
                access_level: 'restricted',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        // Insert sample research
        for (const research of sampleResearch) {
            const { data, error } = await supabase
                .from('research')
                .insert(research)
                .select()
                .single();

            if (error) {
                console.error(`❌ Failed to insert "${research.title}":`, error.message);
            } else {
                console.log(`✅ Created: ${research.title} (${research.access_level})`);
            }
        }

        console.log('\n🎉 ECE research setup completed!');
        console.log('\n📋 Summary:');
        console.log(`   - Department ID: ${eceDeptId}`);
        console.log(`   - Total research records: ${existingResearch.length + sampleResearch.length}`);
        console.log(`   - Public records: ${existingResearch.filter(r => r.access_level === 'public').length + 1}`);
        console.log(`   - Restricted records: ${existingResearch.filter(r => r.access_level === 'restricted').length + 1}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixECEResearch();