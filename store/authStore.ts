import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';

type AuthState = {
    session: Session | null;
    setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            session: null,
            setSession: (session) => set({ session }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => localStorage),
            // Persist only what we need; Supabase can refresh tokens via middleware
            partialize: (state) => ({ session: state.session }),
        }
    )
);