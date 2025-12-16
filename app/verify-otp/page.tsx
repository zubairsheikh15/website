// app/verify-otp/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { Mail, Lock, KeyRound } from 'lucide-react';

// Define OTP types
enum OtpType {
    SIGNUP = 'signup',
    PASSWORD_RESET = 'recovery',
}

function VerifyOtpComponent() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [otp, setOtp] = useState('');
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingResend, setLoadingResend] = useState(false);

    // Read email and type from URL
    const email = searchParams.get('email');
    const otpTypeParam = searchParams.get('otpType');

    // Determine the verification type
    const verificationType = otpTypeParam === 'recovery' ? OtpType.PASSWORD_RESET : OtpType.SIGNUP;
    const isSignupOtp = verificationType === OtpType.SIGNUP;

    const title = isSignupOtp ? 'Verify Your Email' : 'Check Your Email';
    const description = `Enter the 6-digit code sent to ${email || 'your email'}.`;

    useEffect(() => {
        if (!email) {
            toast.error('No email provided. Redirecting to login.');
            router.push('/login');
        }
    }, [email, router]);

    // --- Verify OTP ---
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !otp) return;

        setLoadingVerify(true);
        const toastId = toast.loading('Verifying OTP...');

        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: verificationType,
        });

        toast.dismiss(toastId);

        if (error) {
            toast.error(error.message || 'Invalid or expired OTP.');
            setLoadingVerify(false);
        } else {
            if (isSignupOtp) {
                toast.success('Email verified successfully! Please log in.');
                router.push('/login');
            } else {
                // For password reset, Supabase creates a session.
                // We redirect to the set-new-password page.
                toast.success('OTP Verified! You can now set a new password.');
                router.push('/set-new-password');
            }
            // No need to set loading to false, as we are redirecting
        }
    };

    // --- Resend OTP ---
    const handleResendOtp = async () => {
        if (!email) return;
        setLoadingResend(true);

        let error;
        if (isSignupOtp) {
            // Resend signup confirmation
            ({ error } = await supabase.auth.resend({ type: 'signup', email: email }));
        } else {
            // Resend password reset
            ({ error } = await supabase.auth.resetPasswordForEmail(email));
        }

        setLoadingResend(false);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('A new code has been sent to your email.');
        }
    };

    if (!email) {
        return null; // Redirect is handled in useEffect
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-grayBG">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-medium">
                <div className="text-center">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} className="mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-dark-gray">{title}</h1>
                    <p className="text-gray">{description}</p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-center tracking-[0.5em]"
                            placeholder="000000"
                            maxLength={6}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loadingVerify || loadingResend || otp.length !== 6}>
                        {loadingVerify ? 'Verifying...' : 'Verify'}
                    </Button>
                </form>
                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loadingVerify || loadingResend}
                        className="font-semibold text-primary hover:underline disabled:text-gray-500 disabled:no-underline"
                    >
                        {loadingResend ? 'Sending...' : 'Resend Code'}
                    </button>
                    <Link href="/login" className="block mt-2 text-gray-600 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Wrap with Suspense for useSearchParams()
export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpComponent />
        </Suspense>
    );
}