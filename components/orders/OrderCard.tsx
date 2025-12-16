import { Order } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Package,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    ChevronRight,
    Calendar,
    ShoppingBag,
    ArrowRight
} from "lucide-react";

// Enhanced status configurations with icons and colors
const statusConfig: {
    [key: string]: {
        bg: string;
        text: string;
        icon: any;
        gradient: string;
    }
} = {
    pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        gradient: 'from-yellow-400 to-orange-400'
    },
    processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Package,
        gradient: 'from-blue-400 to-cyan-400'
    },
    shipped: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        icon: Truck,
        gradient: 'from-indigo-400 to-purple-400'
    },
    delivered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        gradient: 'from-green-400 to-emerald-400'
    },
    cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        gradient: 'from-red-400 to-pink-400'
    },
};

// Format date with better styling
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function OrderCard({ order }: { order: Order }) {
    const status = order.status || 'pending';
    const config = statusConfig[status] || {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: Package,
        gradient: 'from-gray-400 to-gray-500'
    };
    const StatusIcon = config.icon;

    // Get first few product images (if available)
    const productImages = order.order_items
        ?.slice(0, 3)
        .map(item => item.products?.image_url)
        .filter(Boolean) || [];

    return (
        <Link href={`/my-orders/${order.id}`} className="block group">
            <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 ease-out overflow-hidden border border-gray-100 group-hover:border-blue-200"
            >
                {/* Gradient accent bar at top */}
                <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

                {/* Main content */}
                <div className="p-5 sm:p-6">
                    {/* Header section */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            {/* Order ID with icon */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${config.bg} transition-opacity duration-200 ease-out group-hover:opacity-90`}>
                                    <StatusIcon className={`h-4 w-4 ${config.text}`} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 truncate">
                                    Order #{order.id.slice(0, 8).toUpperCase()}
                                </h3>
                            </div>

                            {/* Date with calendar icon */}
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(order.created_at)}</span>
                            </div>
                        </div>

                        {/* Status badge */}
                        <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`
                                px-3 py-1.5 text-xs font-semibold rounded-full 
                                capitalize ${config.bg} ${config.text}
                                flex items-center gap-1.5 shadow-sm
                                border border-current border-opacity-20
                            `}
                        >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status}
                        </motion.span>
                    </div>

                    {/* Product preview images */}
                    {productImages.length > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex -space-x-3">
                                {productImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="w-10 h-10 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-gray-100"
                                    >
                                        <img
                                            src={img}
                                            alt="Product"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            {order.order_items.length > 3 && (
                                <span className="text-xs text-gray-500 font-medium">
                                    +{order.order_items.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Divider with gradient */}
                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    {/* Footer section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Items count */}
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            {/* Total price */}
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Total:</span>
                                <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    ₹{order.total_price.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* View details arrow */}
                        <motion.div
                            className="flex items-center gap-1 text-blue-600 text-sm font-medium"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <span className="hidden sm:inline">View Details</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                    </div>
                </div>

                {/* Hover overlay effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    initial={false}
                />

                {/* Shimmer effect on hover */}
                <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    initial={false}
                />
            </motion.div>
        </Link>
    );
}