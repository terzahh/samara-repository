require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function fixECEDepartmentMapping() {
    try {
        console.log('🔧 Fixing Electrical & Computer Engineering department mapping...\n');

        // Get both departments
        const { data: depts, error: deptError } = await supabase
            .from('departments')
            .select('*')
            .or('name.eq.Electrical Engineering,name.eq.Electrical & Computer Engineering');

        if (deptError) {
            console.error('❌ Error fetching departments:', deptError);
            return;
        }

        const electricalEngineering = depts.find(d => d.name === 'Electrical Engineering');
        const electricalComputerEngineering = depts.find(d => d.name === 'Electrical & Computer Engineering');

        console.log('Departments found:');
        console.log(`  - Electrical Engineering: ${electricalEngineering ? electricalEngineering.id : 'NOT FOUND'}`);
        console.log(`  - Electrical & Computer Engineering: ${electricalComputerEngineering ? electricalComputerEngineering.id : 'NOT FOUND'}\n`);

        if (!electricalEngineering || !electricalComputerEngineering) {
            console.error('❌ One or both departments not found!');
            return;
        }

        // Get all research files under "Electrical Engineering"
        const { data: research, error: researchError } = await supabase
            .from('research')
            .select('*')
            .eq('department_id', electricalEngineering.id);

        if (researchError) {
            console.error('❌ Error fetching research:', researchError);
            return;
        }

        console.log(`📚 Found ${research.length} research files under "Electrical Engineering"\n`);

        if (research.length === 0) {
            console.log('✅ No research files to update.');
            return;
        }

        // Update all research files to point to "Electrical & Computer Engineering"
        const { data: updated, error: updateError } = await supabase
            .from('research')
            .update({ department_id: electricalComputerEngineering.id })
            .eq('department_id', electricalEngineering.id)
            .select();

        if (updateError) {
            console.error('❌ Error updating research:', updateError);
            return;
        }

        console.log(`✅ Successfully updated ${updated.length} research files to "Electrical & Computer Engineering"\n`);

        // Verify the update
        const { data: verifyECE, error: verifyECEError } = await supabase
            .from('research')
            .select('id, title')
            .eq('department_id', electricalComputerEngineering.id);

        const { data: verifyEE, error: verifyEEError } = await supabase
            .from('research')
            .select('id, title')
            .eq('department_id', electricalEngineering.id);

        console.log('📊 Verification:');
        console.log(`  - Electrical & Computer Engineering: ${verifyECE?.length || 0} files`);
        console.log(`  - Electrical Engineering: ${verifyEE?.length || 0} files\n`);

        if (verifyECE && verifyECE.length > 0) {
            console.log('Files now under Electrical & Computer Engineering:');
            verifyECE.forEach(r => console.log(`  - ${r.title}`));
        }

        console.log('\n✅ Department mapping fix complete!');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

fixECEDepartmentMapping();
