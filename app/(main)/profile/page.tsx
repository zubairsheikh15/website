// app/(main)/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { logger } from "@/lib/logger";
import { motion } from "framer-motion";
import { User, Mail, Shield, LogOut, Package, MapPin, Edit2, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const { session, setSession } = useAuthStore();
    const [fullName, setFullName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            setFetching(true);
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", session.user.id)
                    .single();

                if (error) {
                    logger.error("Error fetching profile", error);
                } else if (data) {
                    setFullName(data.full_name);
                }
            } catch (err) {
                logger.error("Unexpected error", err);
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [session, router, supabase]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: fullName })
                .eq("id", session.user.id);

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            }
        } catch (err) {
            logger.error("Unexpected error", err);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        router.push("/login");
        toast.success("Signed out successfully");
    };

    if (!session) return null;

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">My Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar / Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-1 space-y-6"
                >
                    {/* User Card */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/20 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-4 shadow-inner ring-4 ring-white dark:ring-black">
                            <User size={40} className="text-muted-foreground" />
                            <div className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                <Camera size={14} />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold font-heading">{fullName || 'User'}</h2>
                        <p className="text-sm text-muted-foreground mb-6">{session.user.email}</p>

                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>

                    {/* Quick Menu */}
                    <div className="glass-panel p-2 rounded-2xl border border-white/20">
                        <Link href="/my-orders" className="flex items-center gap-3 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package size={20} /></div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">My Orders</h3>
                                <p className="text-xs text-muted-foreground">Track & view history</p>
                            </div>
                        </Link>
                        <Link href="/checkout" className="flex items-center gap-3 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><MapPin size={20} /></div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Addresses</h3>
                                <p className="text-xs text-muted-foreground">Manage shipping info</p>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Main Content / Edit Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2"
                >
                    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/20 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                                <Shield className="text-primary" size={20} /> Personal Information
                            </h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isEditing ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                            >
                                <Edit2 size={14} /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={session.user.email || ''}
                                        className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                                        disabled
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">Verified</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={!isEditing}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all ${isEditing ? 'bg-white dark:bg-black/20 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary' : 'bg-transparent border-transparent'}`}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Button type="submit" disabled={loading} className="w-full py-4 rounded-xl mt-4 text-base font-semibold shadow-soft hover:shadow-glow">
                                        {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Saving...</span> : "Save Changes"}
                                    </Button>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
