'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useAuthStore } from '@/store/authStore';
import { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// This component runs on the client and sets the session in our store
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = useSupabase();
    const { setSession } = useAuthStore();

    useEffect(() => {
        // Fetch the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for changes in authentication state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, setSession]);

    return <>{children}</>;
}

// Custom hook for authentication
export function useAuth() {
    const { session } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = useSupabase();

    useEffect(() => {
        if (session?.user) {
            // Fetch user profile
            const fetchProfile = async () => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        logger.error('Error fetching profile', error);
                    } else {
                        setProfile(data);
                    }
                } catch (error) {
                    logger.error('Error fetching profile', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile();
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [session, supabase]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            logger.error('Error signing out', error);
        }
    };

    return {
        user: session?.user || null,
        profile,
        signOut,
        loading
    };
}