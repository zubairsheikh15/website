// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Mail } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Sending reset instructions...');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/set-new-password`,
        });

        toast.dismiss(toastId);
        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Check your email for password reset instructions.');
            // Redirect to the verify-otp page, passing email and type
            // Supabase sends an OTP link, but we can also have a manual page.
            // For this flow, we'll guide them to the manual OTP page.
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&otpType=recovery`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-grayBG">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-medium">
                <div className="text-center">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} className="mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-dark-gray">Forgot Password</h1>
                    <p className="text-gray">Enter your email to get a reset code.</p>
                </div>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Email address"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    Remembered your password?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}