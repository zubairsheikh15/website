// app/set-new-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function SetNewPasswordPage() {
    const supabase = createClient();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasSession, setHasSession] = useState(false);

    // Check if the user is authenticated (which they should be after verifyOtp)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Invalid or expired session. Please try resetting your password again.');
                router.push('/forgot-password');
            } else {
                setHasSession(true);
            }
        };
        checkSession();
    }, [supabase.auth, router]);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Setting new password...');

        const { error } = await supabase.auth.updateUser({ password: password });

        toast.dismiss(toastId);
        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success('Password updated successfully! Please log in.');
            await supabase.auth.signOut(); // Log the user out
            router.push('/login'); // Redirect to login
        }
    };

    if (!hasSession) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-grayBG">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-grayBG">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-medium">
                <div className="text-center">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} className="mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-dark-gray">Set New Password</h1>
                    <p className="text-gray">Enter and confirm your new password.</p>
                </div>
                <form onSubmit={handleSetPassword} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="New Password (min. 6 characters)"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Confirm New Password"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Set New Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}