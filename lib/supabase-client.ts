import { createBrowserClient } from '@supabase/ssr';

// This function can be called in Client Components
export function createClient() {
    // Client-side: use process.env directly as it's available in browser
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing required Supabase environment variables');
    }
    
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}