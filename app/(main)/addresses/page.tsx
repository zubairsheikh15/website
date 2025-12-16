'use client';

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase-client";
import { Address } from "@/lib/types";
import AddressCard from "@/components/profile/AddressCard";
import { PackageOpen, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import AddressCardSkeleton from "@/components/skeletons/AddressCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function AddressesPage() {
    const { session } = useAuthStore();
    const router = useRouter();
    const supabase = createClient();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        const fetchAddresses = async () => {
            const { data } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('is_default', { ascending: false });

            if (data) setAddresses(data);
            setLoading(false);
        };

        fetchAddresses();
    }, [session, router, supabase]);

    if (!session) return null;

    return (
        // Use max-w-5xl for consistency, remove py-10
        <div className="max-w-5xl mx-auto px-4">
            <BackButton />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Addresses</h1>
                <Button asChild>
                    <Link href="/addresses/new" className="flex items-center gap-1.5">
                        <Plus size={18} />
                        Add New
                    </Link>
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        className="space-y-4"
                    >
                        <AddressCardSkeleton />
                        <AddressCardSkeleton />
                    </motion.div>
                ) : addresses.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card text-center p-12"
                    >
                        <PackageOpen size={64} className="mx-auto text-gray-300" />
                        <h1 className="text-2xl font-bold mt-4">No Saved Addresses</h1>
                        <p className="text-gray-500 mt-2">Addresses you add will appear here.</p>
                        <Button asChild className="mt-8">
                            <Link href="/addresses/new" className="flex items-center gap-2">
                                <Plus size={18} />
                                Add Your First Address
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {addresses.map(address => (
                            <motion.div key={address.id} variants={itemVariants}>
                                <AddressCard address={address} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}