// Test Supabase connection and check for users
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../config/database');

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');

    // Test 1: Check if we can connect
    console.log('Test 1: Checking connection...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');

    // Test 2: Try to query users table
    console.log('\nTest 2: Querying users table...');
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, email, display_name, role_id')
        .limit(5);

    if (error) {
        console.error('❌ Error querying users:', error.message);
        console.error('Details:', error);
        return;
    }

    console.log(`✅ Found ${users?.length || 0} users:`);
    users?.forEach(user => {
        console.log(`  - ${user.email} (${user.display_name})`);
    });

    // Test 3: Check roles table
    console.log('\nTest 3: Checking roles table...');
    const { data: roles, error: rolesError } = await supabaseAdmin
        .from('roles')
        .select('*');

    if (rolesError) {
        console.error('❌ Error querying roles:', rolesError.message);
    } else {
        console.log(`✅ Found ${roles?.length || 0} roles:`);
        roles?.forEach(role => {
            console.log(`  - ${role.name}`);
        });
    }

    console.log('\n✅ Connection test complete!');
}

testConnection().catch(console.error);
