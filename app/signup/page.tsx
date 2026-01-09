// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, Star } from 'lucide-react';
import { logger } from '@/lib/logger';
import { motion } from 'framer-motion';

export default function SignUpPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(mobileNumber)) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, phone_number: mobileNumber },
            },
        });

        if (signUpError) {
            setLoading(false);
            toast.error(signUpError.message);
            return;
        }

        if (signUpData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: signUpData.user.id,
                    full_name: fullName,
                    phone_number: mobileNumber
                });

            if (profileError) {
                logger.error("Error creating profile", profileError);
                // Continue despite profile error, user is created
            }
        }

        setLoading(false);

        if (signUpData.user && !signUpData.session) {
            toast.success('Account created! Verification code sent.');
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&otpType=signup`);
        } else if (signUpData.user && signUpData.session) {
            toast.success('Welcome to Zee Crown!');
            router.push('/');
        }
    };

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Left Side - Visuals (Hidden on mobile) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 relative flex-col justify-center items-center bg-gradient-to-br from-indigo-950 to-black text-white p-12 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="relative z-10 max-w-md text-center space-y-6">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                        className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-glow"
                    >
                        <Star className="w-10 h-10 text-white fill-white" />
                    </motion.div>
                    <h2 className="text-4xl font-heading font-bold tracking-tight">
                        Start Your Journey
                    </h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                        Create an account to unlock exclusive offers, track orders, and experience the best of simple luxury.
                    </p>
                </div>
            </motion.div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                <Link
                    href="/"
                    className="absolute top-6 right-6 lg:top-10 lg:right-10 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors z-20"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-[450px]"
                >
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl bg-white/40 dark:bg-black/20 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Create Account</h1>
                            <p className="text-muted-foreground">Join us today for free</p>
                        </div>

                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="John Doe" required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="john@example.com" required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Mobile Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="••••••" minLength={6} required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="••••••" required />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 text-base font-semibold shadow-soft hover:shadow-glow transition-all rounded-xl mt-6"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}