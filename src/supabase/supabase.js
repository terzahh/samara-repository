import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please create a .env file with:');
  console.error('REACT_APP_SUPABASE_URL=your_supabase_project_url');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

// Global fetch wrapper with timeout to prevent indefinite hangs
const fetchWithTimeout = (resource, options = {}) => {
  const { timeout = 30000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, opts) => fetchWithTimeout(url, { ...opts, timeout: 30000 })
  }
});

// Expose for debugging/session checks in Console
if (typeof window !== 'undefined') {
  window.supabase = supabase;
}