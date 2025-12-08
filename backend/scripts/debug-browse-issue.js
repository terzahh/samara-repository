require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBrowseIssue() {
    try {
        console.log('🔍 Debugging browse issue for ECE department...\n');

        // 1. Get all departments with ECE in name
        const { data: eceDepts, error: deptError } = await supabase
            .from('departments')
            .select('id, name')
            .or('name.ilike.%Electrical%,name.ilike.%Computer%');

        if (deptError) throw deptError;

        console.log('ECE-related departments:');
        eceDepts.forEach(dept => {
            console.log(`  - ${dept.name} (ID: ${dept.id})`);
        });

        // 2. For each ECE department, check research
        for (const dept of eceDepts) {
            console.log(`\n📊 Research for "${dept.name}" (ID: ${dept.id}):`);

            const { data: research, error: resError } = await supabase
                .from('research')
                .select('id, title, author, access_level, type, year')
                .eq('department_id', dept.id);

            if (resError) throw resError;

            if (research.length === 0) {
                console.log('   ❌ No research found');
            } else {
                research.forEach(r => {
                    console.log(`   - ${r.title} (${r.access_level}, ${r.type}, ${r.year})`);
                });
            }
        }

        // 3. Test the exact query that the frontend uses
        console.log('\n🧪 Testing frontend query simulation...');

        const testDeptId = eceDepts.find(d => d.name === 'Electrical & Computer Engineering')?.id;
        if (testDeptId) {
            console.log(`Testing with department ID: ${testDeptId}`);

            // Simulate getAllResearch function
            let query = supabase
                .from('research')
                .select(`
                    *,
                    departments(name)
                `, { count: 'exact' });

            // Apply department filter
            query = query.eq('department_id', testDeptId);

            // Apply pagination
            const page = 1;
            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            query = query
                .order('created_at', { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.error('❌ Query error:', error);
            } else {
                console.log(`✅ Query successful: Found ${count} total records`);
                console.log(`   Returned ${data.length} records for page ${page}`);

                if (data.length > 0) {
                    data.forEach(r => {
                        console.log(`   - ${r.title} (${r.access_level})`);
                    });
                } else {
                    console.log('   ❌ No records returned despite count > 0');
                }
            }
        }

        // 4. Check if there are any RLS policies blocking access
        console.log('\n🔒 Checking for potential RLS issues...');

        // Try with different access levels
        const { data: publicResearch } = await supabase
            .from('research')
            .select('id, title, access_level')
            .eq('access_level', 'public')
            .limit(5);

        const { data: restrictedResearch } = await supabase
            .from('research')
            .select('id, title, access_level')
            .eq('access_level', 'restricted')
            .limit(5);

        console.log(`Public research accessible: ${publicResearch?.length || 0} records`);
        console.log(`Restricted research accessible: ${restrictedResearch?.length || 0} records`);

    } catch (error) {
        console.error('❌ Debug error:', error.message);
        process.exit(1);
    }
}

debugBrowseIssue();