// app/login/page.tsx
'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Mail, Lock, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

function LoginPageContent() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const loginSuccessRef = useRef(false);

    const redirect = searchParams.get('redirect');
    const hasBuyNowRedirect = redirect && redirect.includes('buyNow=true');

    useEffect(() => {
        return () => {
            if (hasBuyNowRedirect && !loginSuccessRef.current) {
                sessionStorage.removeItem('buyNowItem');
                localStorage.removeItem('buyNowItem');
            }
        };
    }, [hasBuyNowRedirect]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                toast.error('Email not verified. Please check your OTP.');
                router.push(`/verify-otp?email=${encodeURIComponent(email)}&otpType=signup`);
            } else {
                toast.error(error.message);
            }
            setLoading(false);
        } else {
            loginSuccessRef.current = true;
            toast.success('Welcome back!');
            router.push(redirect || '/');
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Left Side - Visuals (Hidden on mobile) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 relative flex-col justify-center items-center bg-gradient-to-br from-black to-gray-900 text-white p-12 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616486029423-aaa478965c96?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="relative z-10 max-w-md text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-white/20 shadow-glow"
                    >
                        <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h2 className="text-4xl font-heading font-bold tracking-tight">
                        Elevate Your Lifestyle
                    </h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                        Join our community of premium product enthusiasts. Discover quality, style, and exclusivity at Zee Crown.
                    </p>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
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
                    className="w-full max-w-[420px]"
                >
                    <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl bg-white/40 dark:bg-black/20 backdrop-blur-xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome Back</h1>
                            <p className="text-muted-foreground">Sign in to continue your journey</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 text-base font-semibold shadow-soft hover:shadow-glow transition-all rounded-xl mt-4"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Signing In...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Spinner />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}