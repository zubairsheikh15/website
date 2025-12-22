import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This function can be called in Server Components, Server Actions, and Route Handlers.
export function createClient() {
    const cookieStore = cookies()

    // Support both NEXT_PUBLIC_ and EXPO_PUBLIC_ prefixes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing required Supabase environment variables.\n' +
            'Please set these in your .env.local file:\n' +
            'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url (or EXPO_PUBLIC_SUPABASE_URL)\n' +
            'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key (or EXPO_PUBLIC_SUPABASE_ANON_KEY)'
        );
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}