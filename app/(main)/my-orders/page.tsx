// app/(main)/my-orders/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Order } from '@/lib/types';
import OrderCard from '@/components/orders/OrderCard';
import OrderCardSkeleton from '@/components/skeletons/OrderCardSkeleton';
import { logger } from '@/lib/logger';
import {
    PackageOpen,
    AlertTriangle,
    ShoppingCart,
    RefreshCw,
    Filter,
    Package,
    Clock,
    Truck,
    CheckCircle,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const filterConfig: {
    label: string;
    value: OrderStatus;
    icon: React.ElementType;
    color: string;
}[] = [
        { label: 'All', value: 'all', icon: PackageOpen, color: 'bg-primary text-primary-foreground' },
        { label: 'Pending', value: 'pending', icon: Clock, color: 'bg-yellow-500 text-white' },
        { label: 'Processing', value: 'processing', icon: Package, color: 'bg-blue-600 text-white' },
        { label: 'Shipped', value: 'shipped', icon: Truck, color: 'bg-indigo-600 text-white' },
        { label: 'Delivered', value: 'delivered', icon: CheckCircle, color: 'bg-green-600 text-white' },
        { label: 'Cancelled', value: 'cancelled', icon: XCircle, color: 'bg-red-600 text-white' }
    ];

export default function MyOrdersPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');

    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const fetchOrders = useCallback(async () => {
        if (!session) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*))')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                logger.error('Error fetching orders', error);
                setOrders([]);
                setError(error.message);
            } else if (data) {
                setOrders(data as Order[]);
                setFilteredOrders(data as Order[]);
                setActiveFilter('all');
            }
        } catch (err: any) {
            logger.error('Unexpected error', err);
            setOrders([]);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [session, supabase]);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        fetchOrders();
    }, [session, router, fetchOrders]);

    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === activeFilter));
        }
    }, [activeFilter, orders]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchOrders();
    };

    const handleFilterChange = (filter: OrderStatus) => {
        setActiveFilter(filter);
    };

    // --- RENDER FUNCTIONS ---

    const renderLoading = () => (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mt-6 space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
                        <div className="h-4 w-32 bg-muted/60 rounded-lg animate-pulse" />
                    </div>
                </div>
                {/* Filters Skeleton */}
                <div className="flex gap-2 overflow-x-auto pb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse flex-shrink-0" />
                    ))}
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <OrderCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="container mx-auto px-4 py-12 max-w-lg text-center">
            <div className="glass-panel p-12 rounded-3xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-6" />
                <h1 className="text-2xl font-bold font-heading mb-2">Unable to Load Orders</h1>
                <p className="text-muted-foreground mb-6">
                    We encountered an issue while fetching your orders. Please check your connection.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={handleRetry} className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Try Again
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderEmpty = () => (
        <div className="container mx-auto px-4 py-12 max-w-lg text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-12 rounded-3xl border border-white/20"
            >
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageOpen size={48} className="text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold font-heading mb-2">No Orders Yet</h1>
                <p className="text-muted-foreground mb-8">
                    Start your shopping journey and discover amazing products waiting for you.
                </p>
                <Button asChild className="rounded-full px-8 shadow-glow">
                    <Link href="/" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" /> Start Shopping
                    </Link>
                </Button>
            </motion.div>
        </div>
    );

    // --- MAIN RENDER ---

    if (loading) return renderLoading();
    if (!session) return null;
    if (error) return renderError();
    if (orders.length === 0) return renderEmpty();

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold">My Orders</h1>
                    <p className="text-muted-foreground mt-1">Track and manage your {orders.length} purchases</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRetry} className="h-10 w-10 p-0 rounded-full hover:bg-secondary">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </Button>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {filterConfig.map((filter) => {
                        const count = orderStats[filter.value as keyof typeof orderStats] as number || 0;
                        if (filter.value !== 'all' && count === 0) return null;
                        const isActive = activeFilter === filter.value;
                        const Icon = filter.icon;

                        return (
                            <button
                                key={filter.value}
                                onClick={() => handleFilterChange(filter.value)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all flex-shrink-0 border",
                                    isActive
                                        ? "border-primary/20 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{filter.label}</span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[10px] font-bold ml-1",
                                    isActive ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground"
                                )}>
                                    {filter.value === 'all' ? orderStats.total : count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Orders List */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-secondary/20 rounded-3xl border border-dashed border-muted-foreground/30 p-12 text-center"
                        >
                            <PackageOpen size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No orders found in this category.</p>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <OrderCard order={order} />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}