import { createBrowserClient } from '@supabase/ssr';

// This function can be called in Client Components
export function createClient() {
    // Support both NEXT_PUBLIC_ and EXPO_PUBLIC_ prefixes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    // Only validate in browser runtime, not during build/SSR
    if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
        throw new Error(
            'Missing required Supabase environment variables.\n' +
            'Please set NEXT_PUBLIC_SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY) in your .env.local file.'
        );
    }
    
    // For build time, use placeholders (will fail at runtime if not set)
    return createBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
    );
}