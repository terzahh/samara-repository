require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const colleges = require('../src/data/collegesData.js').default;
const fs = require('fs');
const path = require('path');

// Initialize Supabase client - load from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found in environment variables');
    console.error('Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function identifyAndInsertMissingDepartments() {
    try {
        console.log('Fetching existing departments from database...\n');

        // Fetch all departments from database
        const { data: dbDepartments, error } = await supabase
            .from('departments')
            .select('name')
            .order('name');

        if (error) {
            throw error;
        }

        console.log(`Found ${dbDepartments.length} departments in database\n`);

        // Create set of department names in DB for quick lookup
        const dbDeptNames = new Set(dbDepartments.map(d => d.name));

        // Collect all departments from collegesData
        const allDepts = [];
        colleges.forEach(college => {
            if (Array.isArray(college.departments)) {
                college.departments.forEach(dept => {
                    allDepts.push({
                        name: dept.name,
                        college: college.name,
                        programs: dept.programs || []
                    });
                });
            }
        });

        console.log(`Found ${allDepts.length} departments in collegesData.js\n`);

        // Find missing departments
        const missingDepts = allDepts.filter(dept => !dbDeptNames.has(dept.name));

        console.log(`\n=== MISSING DEPARTMENTS (${missingDepts.length}) ===\n`);

        if (missingDepts.length === 0) {
            console.log('✅ All departments from collegesData.js exist in the database!');
            return;
        }

        // Group by college
        const byCollege = {};
        missingDepts.forEach(dept => {
            if (!byCollege[dept.college]) {
                byCollege[dept.college] = [];
            }
            byCollege[dept.college].push(dept);
        });

        // Display missing departments by college
        Object.keys(byCollege).forEach(college => {
            console.log(`${college}:`);
            byCollege[college].forEach(dept => {
                console.log(`  - ${dept.name} (${dept.programs.join(', ')})`);
            });
            console.log('');
        });

        // Generate SQL INSERT statements
        console.log('\n=== INSERTING DEPARTMENTS INTO DATABASE ===\n');

        // Insert departments one by one
        let successCount = 0;
        let failCount = 0;

        for (const dept of missingDepts) {
            try {
                const { error } = await supabase
                    .from('departments')
                    .insert({ name: dept.name });

                if (error) {
                    console.error(`❌ Failed to insert "${dept.name}":`, error.message);
                    failCount++;
                } else {
                    console.log(`✅ Inserted: ${dept.name}`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error inserting "${dept.name}":`, err.message);
                failCount++;
            }
        }

        console.log(`\n=== SUMMARY ===`);
        console.log(`Successfully inserted: ${successCount} departments`);
        console.log(`Failed: ${failCount} departments`);
        console.log(`Total: ${missingDepts.length} departments`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

identifyAndInsertMissingDepartments();
