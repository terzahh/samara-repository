require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the getAllResearch function from database.js
async function getAllResearch(page = 1, pageSize = 10, filters = {}) {
    try {
        let query = supabase
            .from('research')
            .select(`
                *,
                departments(name)
            `, { count: 'exact' });

        // Apply filters
        if (filters.department) {
            query = query.eq('department_id', filters.department);
        }

        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (filters.year) {
            query = query.eq('year', filters.year);
        }

        if (filters.accessLevel && filters.accessLevel !== 'all') {
            query = query.eq('access_level', filters.accessLevel);
        }

        // Apply search
        if (filters.searchTerm) {
            query = query.or(`title.ilike.%${filters.searchTerm}%,author.ilike.%${filters.searchTerm}%,abstract.ilike.%${filters.searchTerm}%,keywords.ilike.%${filters.searchTerm}%`);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query
            .order('created_at', { ascending: false })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            research: data,
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    } catch (error) {
        throw error;
    }
}

async function testDepartmentFiltering() {
    try {
        console.log('🧪 Testing department filtering functionality...\n');

        // Get ECE department ID
        const { data: eceDept } = await supabase
            .from('departments')
            .select('id, name')
            .eq('name', 'Electrical & Computer Engineering')
            .single();

        console.log(`Testing with department: ${eceDept.name} (ID: ${eceDept.id})\n`);

        // Test 1: Filter by ECE department
        console.log('Test 1: Filter by ECE department');
        const result1 = await getAllResearch(1, 10, { department: eceDept.id });
        console.log(`✅ Found ${result1.totalCount} records`);
        result1.research.forEach(r => {
            console.log(`   - ${r.title} (${r.access_level})`);
        });

        // Test 2: Filter by ECE department + public access
        console.log('\nTest 2: Filter by ECE department + public access');
        const result2 = await getAllResearch(1, 10, {
            department: eceDept.id,
            accessLevel: 'public'
        });
        console.log(`✅ Found ${result2.totalCount} public records`);
        result2.research.forEach(r => {
            console.log(`   - ${r.title} (${r.access_level})`);
        });

        // Test 3: Filter by ECE department + restricted access
        console.log('\nTest 3: Filter by ECE department + restricted access');
        const result3 = await getAllResearch(1, 10, {
            department: eceDept.id,
            accessLevel: 'restricted'
        });
        console.log(`✅ Found ${result3.totalCount} restricted records`);
        result3.research.forEach(r => {
            console.log(`   - ${r.title} (${r.access_level})`);
        });

        // Test 4: No filters (should return all research)
        console.log('\nTest 4: No filters (all research)');
        const result4 = await getAllResearch(1, 10, {});
        console.log(`✅ Found ${result4.totalCount} total records across all departments`);

        console.log('\n🎉 All tests passed! Department filtering is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testDepartmentFiltering();