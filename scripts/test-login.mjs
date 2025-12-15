#!/usr/bin/env node
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const [, , email, password] = process.argv;
if (!email || !password) {
    console.error('Usage: node scripts/test-login.mjs <email> <password>');
    process.exit(2);
}

const envFile = process.cwd() + '/.env';
let envText = '';
try {
    envText = fs.readFileSync(envFile, 'utf8');
} catch (e) {
    console.error('.env not found in project root. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.');
    process.exit(2);
}

const get = (key) => {
    const line = envText.split(/\r?\n/).find(l => l.startsWith(key + '='));
    if (!line) return null;
    return line.split('=').slice(1).join('=').trim();
};

const SUPABASE_URL = get('VITE_SUPABASE_URL');
const SUPABASE_KEY = get('VITE_SUPABASE_ANON_KEY');
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
    try {
        console.log('Attempting sign-in for:', email);
        const signIn = await supabase.auth.signInWithPassword({ email, password });
        console.log('\n--- signIn response ---');
        console.log(JSON.stringify(signIn, null, 2));

        // Attempt simple users query to verify role fetch
        console.log('\n--- users select (limit 1) ---');
        const { data, error } = await supabase.from('users').select('role').eq('email', email).limit(1);
        console.log(JSON.stringify({ data, error }, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Runtime error:', err);
        process.exit(1);
    }
})();
