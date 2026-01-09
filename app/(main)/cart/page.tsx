// app/(main)/cart/page.tsx
"use client";

import { createClient } from '@/lib/supabase-client';
import { CartItem } from '@/lib/types';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// UI & Icon Imports
import CartCard from '@/components/cart/CartCard';
import Button from '@/components/ui/Button';
import { ShoppingCart, Loader2, ArrowRight, PackageOpen, Truck, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

// --- Components ---
const FreeShippingBar = ({ subtotal, threshold }: { subtotal: number; threshold: number }) => {
    if (!threshold || subtotal <= 0) return null;

    const remainingAmount = Math.max(0, threshold - subtotal);
    const progressPercentage = Math.min((subtotal / threshold) * 100, 100);
    const isFreeShipping = remainingAmount <= 0;

    return (
        <div className="glass-panel p-5 mb-6 rounded-2xl border border-white/20 relative overflow-hidden">
            {/* Progress Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Truck size={20} />
                    </div>
                    <div>
                        {isFreeShipping ? (
                            <p className="font-semibold text-green-600">🎉 Free Delivery Unlocked!</p>
                        ) : (
                            <p className="font-medium text-foreground">
                                Add <span className="font-bold text-primary">₹{remainingAmount.toFixed(0)}</span> for <span className="text-primary font-bold">Free Delivery</span>
                            </p>
                        )}
                    </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {isFreeShipping ? '100%' : `${Math.round(progressPercentage)}%`} Reached
                </p>
            </div>

            <div className="relative w-full bg-secondary rounded-full h-2 overflow-hidden shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                        "absolute inset-0 rounded-full h-full shadow-lg transition-all duration-300",
                        isFreeShipping ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                    )}
                />
            </div>
        </div>
    );
};

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20" />
            <PackageOpen strokeWidth={1} className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-foreground mb-3">
            Your Cart is Empty
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            Looks like you haven't added anything yet.
        </p>
        <Button asChild className="px-8 py-4 text-base rounded-full shadow-glow">
            <Link href="/" className="flex items-center gap-2">
                Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
        </Button>
    </motion.div>
);

// --- MAIN CART PAGE COMPONENT ---
export default function CartPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [shippingFee, setShippingFee] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

    const fetchCartItems = useCallback(async () => {
        let userId = session?.user?.id;
        if (!userId) {
            const { data: { session: liveSession } } = await supabase.auth.getSession();
            userId = liveSession?.user?.id;
        }
        if (!userId) {
            router.push('/login?redirect=' + encodeURIComponent('/cart'));
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('cart_items')
            .select('id, quantity, products(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            toast.error('Could not fetch your cart.');
            setCartItems([]);
        } else {
            setCartItems((data || []) as unknown as CartItem[]);
        }
        setLoading(false);
    }, [session, supabase, router]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const subtotal = useMemo(() =>
        cartItems.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0),
        [cartItems]
    );

    useEffect(() => {
        // Simplified Shipping Rule Logic (Mocked for speed if DB table is complex, but using DB here)
        const fetchShippingRules = async () => {
            const { data, error } = await supabase
                .from('shipping_rules')
                .select('min_order_value, charge')
                .eq('is_active', true)
                .order('min_order_value', { ascending: false });

            let currentThreshold = 500;
            let currentFee = 40;

            if (!error && data && data.length > 0) {
                const freeRule = data.find(rule => rule.charge === 0);
                if (freeRule) currentThreshold = freeRule.min_order_value;
                const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
                currentFee = applicableRule ? applicableRule.charge : (data[data.length - 1]?.charge ?? 40);
            }

            setFreeShippingThreshold(currentThreshold);
            setShippingFee(subtotal > 0 && subtotal < currentThreshold ? currentFee : 0);
        };
        fetchShippingRules();
    }, [subtotal, supabase]);

    const updateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (!session?.user) return router.push('/login');
        if (newQuantity < 1) return removeItem(cartItemId);

        const originalItems = cartItems.map(item => ({ ...item }));
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

        const { error } = await supabase.from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', cartItemId)
            .eq('user_id', session.user.id);

        if (error) {
            toast.error('Failed to update cart.');
            setCartItems(originalItems);
        }
    };

    const removeItem = async (cartItemId: string) => {
        if (!session?.user) return router.push('/login');

        const originalItems = cartItems.map(item => ({ ...item }));
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));

        const { error } = await supabase.from('cart_items')
            .delete()
            .eq('id', cartItemId)
            .eq('user_id', session.user.id);

        if (error) {
            toast.error('Failed to remove item.');
            setCartItems(originalItems);
        }
    };

    const total = subtotal + shippingFee;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Spinner />
        </div>
    );

    return (
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
            >
                <Link href="/" className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                    My Shopping Bag
                    {cartItems.length > 0 && <span className="ml-2 text-lg text-muted-foreground font-normal">({cartItems.length} Items)</span>}
                </h1>
            </motion.div>

            {cartItems.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
                    {/* Cart Items List */}
                    <div className="flex-grow w-full lg:w-3/5 xl:w-2/3 space-y-6">
                        <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />

                        <div className="space-y-4">
                            <AnimatePresence mode='popLayout'>
                                {cartItems.map((item) => (
                                    <CartCard
                                        key={item.id}
                                        item={item}
                                        onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                                        onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                                        onRemove={() => removeItem(item.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-2/5 xl:w-1/3 lg:sticky lg:top-24">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-panel p-6 md:p-8 rounded-3xl border border-white/20 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                            <h2 className="text-2xl font-bold mb-6 text-foreground font-heading">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className={cn("font-medium", shippingFee === 0 ? "text-green-500" : "text-foreground")}>
                                        {shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px w-full bg-border/50 mb-6" />

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-lg font-bold text-foreground">Total</span>
                                <span className="text-3xl font-bold text-primary">₹{total.toFixed(2)}</span>
                            </div>

                            <Button
                                onClick={() => router.push('/checkout')}
                                className="w-full py-5 text-lg font-bold rounded-xl shadow-soft hover:shadow-glow transition-all"
                                disabled={subtotal === 0}
                            >
                                Checkout Now <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Secure Checkout. 100% Authentic Products.
                            </p>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}