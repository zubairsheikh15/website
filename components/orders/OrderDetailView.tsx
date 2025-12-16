// components/orders/OrderDetailView.tsx
'use client'

import { Order } from "@/lib/types";
import Image from "next/image";
import BackButton from "../ui/BackButton";
import { logger } from '@/lib/logger';
import {
    MapPin,
    CreditCard,
    Package,
    CheckCircle,
    Truck,
    Home,
    Clock,
    XCircle,
    Phone,
    Calendar,
    Tag,
    Download,
    Share2,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // --- 1. IMPORT useRouter ---

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to format the address object
const formatAddress = (addr: any) => {
    if (typeof addr === 'string') return addr;
    if (!addr) return "No address provided.";

    const parts = [
        addr.house_no,
        addr.street_address,
        addr.landmark ? `(Near ${addr.landmark})` : null,
        `${addr.city}, ${addr.state} - ${addr.postal_code}`,
        addr.country
    ];

    return parts.filter(Boolean).join(', ');
};

// Enhanced status configurations
const statusConfig: { [key: string]: { color: string; bg: string; icon: any; gradient: string } } = {
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, gradient: 'from-yellow-400 to-orange-400' },
    processing: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Package, gradient: 'from-blue-400 to-cyan-400' },
    shipped: { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Truck, gradient: 'from-indigo-400 to-purple-400' },
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, gradient: 'from-green-400 to-emerald-400' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, gradient: 'from-red-400 to-pink-400' }
};

const OrderStatusTracker = ({ status }: { status: Order['status'] }) => {
    const statuses: Order['status'][] = ['processing', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    const StatusItem = ({
        icon: Icon,
        label,
        isCompleted,
        isFirst,
        isLast,
        index
    }: {
        icon: any,
        label: string,
        isCompleted: boolean,
        isFirst?: boolean,
        isLast?: boolean,
        index: number
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative flex flex-col items-center text-center flex-1"
        >
            {!isFirst && (
                <div className="absolute top-6 right-1/2 w-full h-1 -z-10">
                    <div className="h-full w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted ? '100%' : '0%' }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        />
                    </div>
                </div>
            )}
            <motion.div
                whileHover={{ scale: 1.1 }}
                className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                    isCompleted
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                )}
            >
                <Icon size={20} />
                {isCompleted && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
                    >
                        <CheckCircle size={12} className="text-white" />
                    </motion.div>
                )}
            </motion.div>
            <p className={cn(
                "mt-3 text-xs md:text-sm font-semibold transition-colors",
                isCompleted ? 'text-gray-900' : 'text-gray-400'
            )}>
                {label}
            </p>
            {isCompleted && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-500 mt-1"
                >
                    Completed
                </motion.p>
            )}
        </motion.div>
    );

    return (
        <div className="flex justify-between items-start pt-6 pb-4">
            <StatusItem icon={Package} label="Processing" isCompleted={currentStatusIndex >= 0} isFirst index={0} />
            <StatusItem icon={Truck} label="Shipped" isCompleted={currentStatusIndex >= 1} index={1} />
            <StatusItem icon={Home} label="Delivered" isCompleted={currentStatusIndex >= 2} isLast index={2} />
        </div>
    );
};

const InfoCard = ({
    icon: Icon,
    title,
    children,
    gradient
}: {
    icon: any,
    title: string,
    children: React.ReactNode,
    gradient?: string
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100"
    >
        <div className={`h-1.5 bg-gradient-to-r ${gradient || 'from-blue-400 to-indigo-400'}`} />
        <div className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient || 'from-blue-100 to-indigo-100'}`}>
                    <Icon size={20} className="text-blue-600" />
                </div>
                {title}
            </h2>
            {children}
        </div>
    </motion.div>
);

const OrderItemCard = ({ item, index }: { item: any, index: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.2 }}
        className="group relative flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 ease-out"
    >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-md">
            <Image
                src={item.products.image_url}
                alt={item.products.name}
                fill
                sizes="96px"
                className="object-cover"
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                x{item.quantity}
            </div>
        </div>
        <div className="flex-grow min-w-0">
            <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                {item.products.name}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <Tag size={14} />
                    ₹{item.price_at_purchase.toFixed(2)} each
                </span>
                <span className="flex items-center gap-1">
                    <Package size={14} />
                    Qty: {item.quantity}
                </span>
            </div>
        </div>
        <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500 mb-1">Subtotal</p>
            <p className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ₹{(item.quantity * item.price_at_purchase).toFixed(2)}
            </p>
        </div>
        <ChevronRight className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" size={20} />
    </motion.div>
);

export default function OrderDetailView({ order }: { order: Order }) {
    const router = useRouter(); // --- 2. INITIALIZE useRouter ---
    const isCancelled = order.status === 'cancelled';
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const [isDownloading, setIsDownloading] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: 'My Zee Crown Order',
            text: `Check out my order details: #${order.id.slice(0, 12).toUpperCase()}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                logger.error('Error sharing', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast.success('Order link copied to clipboard!');
            } catch (err) {
                logger.error('Error copying to clipboard', err);
                toast.error('Could not copy link.');
            }
        }
    };

    const handleDownloadInvoice = async () => {
        setIsDownloading(true);
        const toastId = toast.loading('Generating invoice...');

        try {
            const doc = new jsPDF();
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 14;

            // --- Header ---
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Zee Crown Invoice", margin, 22);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Order: #${order.id.slice(0, 12).toUpperCase()}`, margin, 30);
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, margin, 36);

            // --- Shipping Address ---
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Shipping To:", margin, 50);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            const addressLines = [
                order.shipping_address?.full_name || 'N/A',
                formatAddress(order.shipping_address),
                `Phone: ${order.shipping_address?.mobile_number || 'N/A'}`
            ];
            doc.text(addressLines, margin, 58);

            // --- Order Items Table ---
            const tableColumns = ["Item Name", "Quantity", "Price", "Total"];
            const tableData = order.order_items.map(item => [
                item.products.name,
                item.quantity,
                `₹${item.price_at_purchase.toFixed(2)}`,
                `₹${(item.quantity * item.price_at_purchase).toFixed(2)}`
            ]);

            autoTable(doc, {
                head: [tableColumns],
                body: tableData,
                startY: 75, // Start table after address
                headStyles: { fillColor: [37, 99, 235] }, // Blue header
                theme: 'striped'
            });

            // --- Total ---
            const finalY = (doc as any).lastAutoTable.finalY || 100;
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            const totalText = `Total: ₹${order.total_price.toFixed(2)}`;
            const totalTextWidth = doc.getTextWidth(totalText);
            doc.text(totalText, pageWidth - margin - totalTextWidth, finalY + 15);

            // --- Footer ---
            const footerText = "Thank you for shopping with Zee Crown!";
            doc.setFontSize(10);
            doc.setTextColor(150);
            const footerTextWidth = doc.getTextWidth(footerText);
            doc.text(footerText, (pageWidth - footerTextWidth) / 2, pageHeight - margin);

            // --- Save the PDF ---
            doc.save(`ZeeCrown_Invoice_${order.id.slice(0, 8)}.pdf`);

            toast.success('Invoice downloaded!', { id: toastId });

        } catch (error: any) {
            logger.error("PDF Generation Error", error);
            toast.error(error.message || 'Failed to generate PDF.', { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
            <BackButton />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
            >
                <div className={`h-1.5 bg-gradient-to-r ${config.gradient} rounded-t-2xl -mx-6 -mt-6 mb-6`} />

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Order Details
                            </h1>
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className={`p-2 rounded-xl ${config.bg}`}
                            >
                                <StatusIcon size={24} className={config.color} />
                            </motion.div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1.5 font-mono font-semibold text-gray-700">
                                <Package size={16} />
                                #{order.id.slice(0, 12).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-full capitalize flex items-center gap-2 shadow-md",
                                config.bg,
                                config.color
                            )}
                        >
                            <StatusIcon size={18} />
                            {order.status}
                        </motion.span>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Share order"
                        >
                            <Share2 size={18} className="text-gray-600" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownloadInvoice}
                            disabled={isDownloading}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download invoice"
                        >
                            {isDownloading ? (
                                <Loader2 size={18} className="text-gray-600 animate-spin" />
                            ) : (
                                <Download size={18} className="text-gray-600" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Order Status Tracker */}
            {!isCancelled && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
                >
                    <h2 className="text-xl font-bold mb-2 text-center">Order Progress</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">Track your order journey</p>
                    <OrderStatusTracker status={order.status} />
                </motion.div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <InfoCard
                    icon={MapPin}
                    title="Shipping Address"
                    gradient="from-purple-100 to-pink-100"
                >
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-50">
                                <Home size={16} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">
                                    {order.shipping_address?.full_name ?? 'No name provided'}
                                </p>
                                <p className="text-gray-600 mt-1 leading-relaxed">
                                    {formatAddress(order.shipping_address)}
                                </p>
                            </div>
                        </div>
                        {order.shipping_address?.mobile_number && (
                            <div className="flex items-center gap-2 pt-3 border-t">
                                <Phone size={16} className="text-blue-600" />
                                <span className="font-semibold text-gray-700">
                                    {order.shipping_address.mobile_number}
                                </span>
                            </div>
                        )}
                    </div>
                </InfoCard>

                {/* Payment Details */}
                <InfoCard
                    icon={CreditCard}
                    title="Payment Summary"
                    gradient="from-green-100 to-emerald-100"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600 font-medium">Payment Method</span>
                            <span className="font-bold text-gray-900 capitalize">
                                {order.payment_method}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                            <span className="text-gray-700 font-semibold text-lg">Order Total</span>
                            <span className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                ₹{order.total_price.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                            Inclusive of all taxes and charges
                        </div>
                    </div>
                </InfoCard>
            </div>

            {/* Items Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Order Items</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'} in this order
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                        <Package size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">
                            {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} units
                        </span>
                    </div>
                </div>
                <div className="space-y-4">
                    {order.order_items.map((item, index) => (
                        <OrderItemCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            </motion.div>

            {/* Order Summary Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-600">Need help with your order?</p>
                        <p className="font-semibold text-gray-900">Contact our support team</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        // Navigate to your help page
                        onClick={() => router.push('/help')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Get Support
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}