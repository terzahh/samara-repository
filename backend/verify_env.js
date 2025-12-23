require('dotenv').config();

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;
const clientUrl = process.env.CLIENT_URL;

console.log('--- ENV CHECK ---');
console.log('SUPABASE_URL:', url ? (url.includes('\n') ? 'HAS NEWLINES' : 'OK') : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY length:', key ? key.length : 0);
console.log('SUPABASE_SERVICE_ROLE_KEY has newlines:', key ? key.includes('\n') : 'N/A');
console.log('CLIENT_URL:', clientUrl);
console.log('--- END ENV CHECK ---');
