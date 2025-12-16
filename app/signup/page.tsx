// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { User, Mail, Lock, Phone } from 'lucide-react'; // Added Phone icon
import Image from 'next/image';
import { logger } from '@/lib/logger';

export default function SignUpPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Added state for confirm password
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState(''); // Added state for mobile number
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- Validation ---
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.'); // Keep min length check
            return;
        }
        // Basic mobile number validation (optional, adjust regex as needed for India)
        const phoneRegex = /^[6-9]\d{9}$/; // Starts with 6-9, 10 digits total
        if (!phoneRegex.test(mobileNumber)) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return;
        }
        // ------------------

        setLoading(true);
        const toastId = toast.loading('Creating account...');

        // Sign up the user with email, password, and metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: mobileNumber, // Add phone number to metadata
                },
            },
        });

        if (signUpError) {
            setLoading(false);
            toast.dismiss(toastId);
            toast.error(signUpError.message);
            return;
        }

        // Insert into profiles table
        if (signUpData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: signUpData.user.id,
                    full_name: fullName,
                    phone_number: mobileNumber // Add phone number to profile table
                });

            if (profileError) {
                setLoading(false);
                toast.dismiss(toastId);
                logger.error("Error creating profile", profileError);
                toast.error("Account created, but profile update failed. Please contact support.");
                // Allow verification to proceed despite profile error
            }
        }

        setLoading(false);
        toast.dismiss(toastId);

        // Check if user needs verification
        if (signUpData.user && !signUpData.session) {
            toast.success('Account created! Please check your email for an OTP.');
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&otpType=signup`);
        } else if (signUpData.user && signUpData.session) {
            toast.success('Account created successfully!');
            router.push('/');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-grayBG py-12"> {/* Added py-12 for spacing */}
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-medium">
                <div className="text-center">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} className="mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-dark-gray">Create an Account</h1>
                    <p className="text-gray">Start your journey with Zee Crown.</p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Full Name */}
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Full Name" required />
                    </div>
                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Email address" required />
                    </div>
                    {/* Mobile Number */}
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="tel" // Use tel type for mobile
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} // Allow only numbers, max 10 digits
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Mobile Number (10 digits)"
                            maxLength={10} // Enforce max length
                            required
                        />
                    </div>
                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Password (min. 6 characters)" minLength={6} required />
                    </div>
                    {/* Confirm Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} fullWidth> {/* Make button full width */}
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}