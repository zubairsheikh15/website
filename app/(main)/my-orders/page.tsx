// app/(main)/my-orders/page.tsx (OPTIMIZED - Remove heavy animations)
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

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const filterConfig: {
    label: string;
    value: OrderStatus;
    icon: React.ElementType;
    activeClass: string;
}[] = [
        { label: 'All', value: 'all', icon: PackageOpen, activeClass: 'bg-primary text-white' },
        { label: 'Pending', value: 'pending', icon: Clock, activeClass: 'bg-yellow-500 text-white' },
        { label: 'Processing', value: 'processing', icon: Package, activeClass: 'bg-blue-600 text-white' },
        { label: 'Shipped', value: 'shipped', icon: Truck, activeClass: 'bg-indigo-600 text-white' },
        { label: 'Delivered', value: 'delivered', icon: CheckCircle, activeClass: 'bg-green-600 text-white' },
        { label: 'Cancelled', value: 'cancelled', icon: XCircle, activeClass: 'bg-red-600 text-white' }
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
        totalSpent: orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
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
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="mt-6 space-y-6">
                <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <OrderCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="bg-white shadow-md rounded-xl text-center p-12 mt-8">
                <AlertTriangle size={72} className="mx-auto text-red-500" />
                <h1 className="text-2xl sm:text-3xl font-bold mt-6">Unable to Load Orders</h1>
                <p className="text-gray-600 mt-3 max-w-md mx-auto">
                    We encountered an issue while fetching your orders. This might be a temporary connection problem.
                </p>
                {retryCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                        Retry attempt: {retryCount}
                    </p>
                )}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleRetry} className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderEmpty = () => (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="bg-white shadow-md rounded-xl text-center p-12 mt-8">
                <PackageOpen size={80} className="mx-auto text-gray-300" />
                <h1 className="text-2xl sm:text-3xl font-bold mt-6">No Orders Yet</h1>
                <p className="text-gray-500 mt-3 max-w-md mx-auto">
                    Start your shopping journey and discover amazing products waiting for you.
                </p>
                <Button asChild className="mt-8">
                    <Link href="/" className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Start Shopping
                    </Link>
                </Button>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    if (loading) return renderLoading();
    if (!session) return null;
    if (error) return renderError();
    if (orders.length === 0) return renderEmpty();

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <BackButton />

            {/* Header */}
            <div className="mt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">My Orders</h1>
                        <p className="text-gray-600 mt-1">
                            Track and manage your purchases
                        </p>
                    </div>
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-8 bg-white shadow-sm rounded-lg p-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                    {filterConfig.map((filter) => {
                        const count = orderStats[filter.value as keyof typeof orderStats] as number || 0;
                        if (filter.value !== 'all' && count === 0) return null;

                        return (
                            <button
                                key={filter.value}
                                onClick={() => handleFilterChange(filter.value)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0",
                                    activeFilter === filter.value
                                        ? filter.activeClass
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <filter.icon className="h-4 w-4" />
                                <span>{filter.label}</span>
                                <span
                                    className={cn(
                                        "ml-1.5 px-2 py-0.5 rounded-full text-xs",
                                        activeFilter === filter.value
                                            ? "bg-white/20"
                                            : "bg-gray-200 text-gray-600"
                                    )}
                                >
                                    {filter.value === 'all' ? orderStats.total : count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders List - NO ANIMATIONS */}
            <div className="mt-8 space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white shadow-sm rounded-xl text-center p-12">
                        <PackageOpen size={48} className="mx-auto text-gray-300" />
                        <p className="text-gray-600 mt-4">
                            No orders found with status: <span className="font-semibold">{activeFilter}</span>
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))
                )}
            </div>
        </div>
    );
}