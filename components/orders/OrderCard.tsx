// components/orders/OrderCard.tsx
'use client';

import { Order, OrderItem } from '@/lib/types';
import Link from 'next/link';
import { ChevronRight, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/10' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/10' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/10' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-500/10' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100 dark:bg-red-500/10' },
};

export default function OrderCard({ order }: { order: Order }) {
    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    // Calculate total items
    const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

    // Get first few images for preview
    const previewItems = order.order_items.slice(0, 4);
    const hasMore = order.order_items.length > 4;

    return (
        <Link
            href={`/my-orders/${order.id}`}
            className="group block relative overflow-hidden"
        >
            <div className="glass-panel p-0 rounded-3xl border border-white/20 hover:border-primary/30 hover:shadow-lg transition-all duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50 bg-secondary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl shadow-sm">
                            <StatusIcon className={cn("w-5 h-5", status.color.split(' ')[0])} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Order #{order.id.slice(0, 8)}</p>
                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold", status.color)}>
                                <span>{status.label}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">{new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-lg font-bold text-primary">₹{order.total_price.toFixed(2)}</p>
                    </div>
                </div>

                {/* Items Preview */}
                <div className="p-5">
                    <p className="text-sm text-foreground font-medium mb-3">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'} purchased
                    </p>
                    <div className="flex items-center gap-2">
                        {previewItems.map((item) => (
                            <div key={item.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-white">
                                <Image
                                    src={item.products.image_url || '/placeholder.png'}
                                    alt={item.products.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                        {hasMore && (
                            <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                                +{order.order_items.length - 4}
                            </div>
                        )}
                    </div>
                </div>

                {/* Hover Action */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300">
                    <div className="p-3 bg-primary text-white rounded-full shadow-lg">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </Link>
    );
}