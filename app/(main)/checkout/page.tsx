// app/(main)/checkout/page.tsx
"use client";

import { createClient } from '@/lib/supabase-client';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Address, CartItem, Product } from '@/lib/types';
import toast from 'react-hot-toast';

import Button from '@/components/ui/Button';
import { Loader2, PlusCircle, Pencil, MapPin, CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddressForm from '@/components/profile/AddressForm';
import { useCart } from '@/store/CartContext';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

// Define Razorpay at the window level for TypeScript
declare const window: any;

// Define a type for the Buy Now item stored in sessionStorage
interface BuyNowItem {
    product_id: string;
    quantity: number;
    products: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'mrp' | 'description' | 'category'>;
}

// --- Main Checkout Page Component Logic ---
function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session } = useAuthStore();
    const supabase = createClient();
    const { clearCart } = useCart();

    // State Management
    const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);

    // Check if this is a "Buy Now" flow
    const isBuyNowFlow = useMemo(() => searchParams.get('buyNow') === 'true', [searchParams]);

    // Fetch initial data (either single Buy Now item or full cart)
    const fetchData = useCallback(async () => {
        let effectiveSession = session;
        if (!effectiveSession) {
            const { data: { session: liveSession } } = await supabase.auth.getSession();
            effectiveSession = liveSession || null;
        }
        if (!effectiveSession) {
            if (isBuyNowFlow) {
                const itemString = sessionStorage.getItem('buyNowItem') || localStorage.getItem('buyNowItem');
                if (!itemString) {
                    router.push('/');
                    return;
                }
            }
            const redirectUrl = isBuyNowFlow ? '/checkout?buyNow=true' : '/checkout';
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }
        setLoading(true);
        setShowAddAddress(false);

        let itemsToCheckout: CartItem[] = [];
        let dataError = false;

        if (isBuyNowFlow) {
            try {
                const itemString = sessionStorage.getItem('buyNowItem') || localStorage.getItem('buyNowItem');
                if (!itemString) {
                    const pid = searchParams.get('pid');
                    const qty = parseInt(searchParams.get('qty') || '1', 10) || 1;
                    if (!pid) {
                        toast.error('No item found. Please select a product again.');
                        router.push('/');
                        return;
                    }
                    const { data: product, error: pErr } = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', pid)
                        .single();
                    if (pErr || !product) {
                        toast.error("Could not load the product.");
                        router.push('/');
                        return;
                    }
                    itemsToCheckout = [{
                        id: `buyNow-${pid}`,
                        user_id: effectiveSession.user.id,
                        product_id: pid,
                        quantity: qty,
                        created_at: new Date().toISOString(),
                        products: { ...product }
                    }];
                } else {
                    const buyNowItem: BuyNowItem = JSON.parse(itemString);
                    itemsToCheckout = [{
                        id: `buyNow-${buyNowItem.product_id}`,
                        user_id: effectiveSession.user.id,
                        product_id: buyNowItem.product_id,
                        quantity: buyNowItem.quantity,
                        created_at: new Date().toISOString(),
                        products: {
                            ...buyNowItem.products,
                            description: buyNowItem.products.description || '',
                            category: buyNowItem.products.category || '',
                            created_at: new Date().toISOString(),
                        }
                    }];
                }
            } catch (error) {
                logger.error("Error parsing Buy Now item", error);
                toast.error("Error loading item for Buy Now.");
                router.push('/');
                return;
            }
        } else {
            const { data: cartData, error: cartError } = await supabase
                .from('cart_items')
                .select('*, products(*)')
                .eq('user_id', effectiveSession.user.id);

            if (cartError) {
                toast.error("Failed to load cart items.");
                dataError = true;
            } else if (!cartData || cartData.length === 0) {
                toast.error("Your cart is empty.");
                router.push('/');
                return;
            } else {
                itemsToCheckout = cartData as CartItem[];
            }
        }

        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', effectiveSession.user.id)
            .order('is_default', { ascending: false });

        if (addressError) {
            toast.error("Failed to load addresses.");
            dataError = true;
        }

        if (dataError) {
            setLoading(false);
            router.push(isBuyNowFlow ? '/' : '/cart');
            return;
        }

        setCheckoutItems(itemsToCheckout);
        setAddresses(addressData || []);

        if (addressData && addressData.length > 0) {
            const defaultAddress = addressData.find(addr => addr.is_default) || addressData[0];
            setSelectedAddressId(defaultAddress.id);
            setShowAddAddress(false);
        } else {
            setShowAddAddress(true);
        }

        setLoading(false);
    }, [session, supabase, router, isBuyNowFlow, searchParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData, isBuyNowFlow]);


    // Calculate totals based on checkoutItems
    const subtotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0), [checkoutItems]);

    // Fetch Shipping Fee
    useEffect(() => {
        const fetchShippingFee = async () => {
            if (subtotal === 0) {
                setShippingFee(0);
                return;
            }
            let fee = 40;
            let threshold = 500;

            try {
                const { data } = await supabase
                    .from('shipping_rules')
                    .select('charge, min_order_value')
                    .eq('is_active', true)
                    .order('min_order_value', { ascending: false });

                if (data && data.length > 0) {
                    const freeRule = data.find(rule => rule.charge === 0);
                    if (freeRule) threshold = freeRule.min_order_value;

                    const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
                    fee = applicableRule ? applicableRule.charge : (data[data.length - 1]?.charge ?? 40);
                }
            } catch (error) {
                logger.error("Error fetching shipping rules", error);
            }

            setShippingFee(subtotal >= threshold ? 0 : fee);
        };
        fetchShippingFee();
    }, [subtotal, supabase]);


    const total = subtotal + shippingFee;

    const handleConfirmOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select or add a shipping address.");
            return;
        }
        setIsProcessing(true);

        try {
            const functionBody: { address_id: string; payment_method: string; buy_now_item?: BuyNowItem } = {
                address_id: selectedAddressId,
                payment_method: selectedPaymentMethod === 'ONLINE' ? 'Paid' : 'COD',
            };

            if (isBuyNowFlow) {
                const itemString = sessionStorage.getItem('buyNowItem');
                if (itemString) {
                    functionBody.buy_now_item = JSON.parse(itemString);
                } else {
                    const pid = searchParams.get('pid');
                    const qty = parseInt(searchParams.get('qty') || '1', 10) || 1;
                    if (pid) {
                        const item = checkoutItems.find(i => i.product_id === pid);
                        if (item) {
                            functionBody.buy_now_item = {
                                product_id: item.product_id,
                                quantity: item.quantity,
                                products: item.products
                            };
                        } else {
                            throw new Error("Buy Now item data not found.");
                        }
                    } else {
                        throw new Error("Buy Now item data is missing.");
                    }
                }
            }

            if (selectedPaymentMethod === 'ONLINE') {
                const { data: orderData, error: orderError } = await supabase.functions.invoke(
                    'create-razorpay-order', { body: { amount: total, currency: 'INR', receipt: `receipt_${Date.now()}` } }
                );
                if (orderError) throw new Error(`Razorpay Order Error: ${orderError.message}`);
                if (!orderData?.id) throw new Error("Failed to create Razorpay order ID.");


                const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
                if (!razorpayKeyId) {
                    throw new Error('Razorpay key is not configured');
                }
                const options = {
                    key: razorpayKeyId,
                    amount: orderData.amount,
                    currency: 'INR',
                    name: 'Zee Crown',
                    description: 'Order Payment',
                    order_id: orderData.id,
                    handler: async (response: any) => {
                        try {
                            const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                            const responseApi = await fetch('/api/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    address: selectedAddress,
                                    cartItems: checkoutItems,
                                    total,
                                    payment: {
                                        method: 'ONLINE',
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_signature: response.razorpay_signature
                                    }
                                })
                            });
                            const finalOrder = await responseApi.json();
                            if (!responseApi.ok) throw new Error(finalOrder?.error || 'Order creation failed');
                            if (!finalOrder?.orderId) throw new Error('Order ID not received after creation.');

                            if (isBuyNowFlow) {
                                sessionStorage.removeItem('buyNowItem');
                            } else {
                                clearCart();
                            }

                            toast.success('Order placed successfully!');
                            router.replace(`/my-orders/${finalOrder.orderId}`);

                        } catch (finalOrderError: any) {
                            logger.error("Error in handler after payment", finalOrderError);
                            toast.error(finalOrderError.message || 'Failed to finalize order after payment.');
                            setIsProcessing(false);
                        }
                    },
                    prefill: {
                        name: session?.user.user_metadata.full_name || 'Customer',
                        email: session?.user.email,
                        contact: selectedAddress?.mobile_number || '',
                    },
                    theme: { color: '#FF7C30' }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
                rzp.on('payment.failed', (response: any) => {
                    logger.error('Razorpay Payment Failed', response.error);
                    toast.error(`Payment Failed: ${response.error.description || 'Unknown error'}`);
                    setIsProcessing(false);
                });

            } else { // COD
                const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                const responseApi = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: selectedAddress,
                        cartItems: checkoutItems,
                        total,
                        payment: { method: 'COD' }
                    })
                });
                const finalOrder = await responseApi.json();
                if (!responseApi.ok) throw new Error(finalOrder?.error || 'Order creation failed');
                if (!finalOrder?.orderId) throw new Error('Order ID not received after creation.');

                if (isBuyNowFlow) {
                    sessionStorage.removeItem('buyNowItem');
                } else {
                    clearCart();
                }

                toast.success('Order placed successfully!');
                router.replace(`/my-orders/${finalOrder.orderId}`);
            }
        } catch (error: any) {
            logger.error("Order confirmation error", error);
            toast.error(error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
                    <ArrowRight size={14} />
                    <span className="text-foreground font-medium">Checkout</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                    Secure Checkout
                </h1>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">

                {/* Left Side: Steps */}
                <div className="flex-grow w-full lg:w-3/5 xl:w-2/3 space-y-8">

                    {/* 1. Shipping Address */}
                    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/20 relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">1</div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading">Shipping Address</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            {addresses.length > 0 && !showAddAddress ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map(addr => (
                                            <AddressCard
                                                key={addr.id}
                                                address={addr}
                                                isSelected={selectedAddressId === addr.id}
                                                onSelect={() => setSelectedAddressId(addr.id)}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowAddAddress(true)}
                                        className="flex items-center gap-2 text-primary font-semibold mt-4 hover:translate-x-2 transition-transform py-2"
                                    >
                                        <PlusCircle size={20} /> Add New Address
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <AddressForm
                                        onSave={() => fetchData()}
                                        onCancel={addresses.length > 0 ? () => setShowAddAddress(false) : undefined}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Payment Method */}
                    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/20 relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">2</div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading">Payment Method</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <PaymentOption
                                label="Cash on Delivery"
                                value="COD"
                                selected={selectedPaymentMethod}
                                onSelect={setSelectedPaymentMethod}
                                icon={Banknote}
                                desc="Pay physically upon delivery"
                            />
                            <PaymentOption
                                label="Pay Online"
                                value="ONLINE"
                                selected={selectedPaymentMethod}
                                onSelect={setSelectedPaymentMethod}
                                icon={CreditCard}
                                desc="UPI, Cards, Netbanking"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="w-full lg:w-2/5 xl:w-1/3 lg:sticky lg:top-24">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-6 md:p-8 rounded-3xl border border-white/20 shadow-lg relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl"
                    >
                        <h2 className="text-xl font-bold mb-6 font-heading border-b border-border/50 pb-4">Order Summary</h2>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar mb-6 pr-2">
                            {checkoutItems.map(item => (
                                <div key={item.id} className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-2">{item.products.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-bold">₹{(item.products.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border/50">
                            <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                            <SummaryRow label="Shipping" value={shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'FREE'} isHighlight={shippingFee === 0} />

                            <div className="flex justify-between items-end pt-4 border-t border-border/50 mt-4">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-3xl font-bold text-primary">₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleConfirmOrder}
                            disabled={isProcessing || loading || checkoutItems.length === 0 || !selectedAddressId}
                            className="w-full mt-8 py-5 text-lg font-bold rounded-xl shadow-glow"
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span>
                            ) : (
                                `Pay ₹${total.toFixed(2)}`
                            )}
                        </Button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span>SSL Encrypted Secure Payment</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// --- Sub-components for Checkout Page ---

const AddressCard = ({ address, isSelected, onSelect }: { address: Address; isSelected: boolean; onSelect: () => void; }) => (
    <motion.div
        layout
        onClick={onSelect}
        className={cn(
            "p-5 border rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group",
            isSelected
                ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                : 'border-white/20 bg-white/50 dark:bg-black/20 hover:border-primary/50 hover:bg-white/80 dark:hover:bg-black/40'
        )}
    >
        {isSelected && (
            <motion.div
                layoutId="active-address-check"
                className="absolute top-2 right-2 text-primary"
            >
                <CheckCircle2 size={20} fill="currentColor" className="text-white" />
            </motion.div>
        )}

        <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-full flex-shrink-0 transition-colors", isSelected ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary')}>
                <MapPin size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{address.landmark || 'Saved Address'}</p>
                <p className="text-sm text-muted-foreground font-medium truncate mb-1">{address.street_address}</p>
                <p className="text-xs text-muted-foreground truncate">{address.city}, {address.state} - {address.postal_code}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">{address.mobile_number}</p>
            </div>

            <Link href={`/addresses/edit/${address.id}`} className="absolute bottom-4 right-4 p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all" onClick={(e) => e.stopPropagation()}>
                <Pencil size={16} />
            </Link>
        </div>
    </motion.div>
);


const PaymentOption = ({ label, value, selected, onSelect, icon: Icon, desc }: { label: string; value: string; selected: string; onSelect: (val: string) => void, icon: any, desc: string }) => (
    <div
        onClick={() => onSelect(value)}
        className={cn(
            "flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden",
            selected === value
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg'
                : 'border-white/20 bg-white/30 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40'
        )}
    >
        <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 transition-colors",
            selected === value ? "bg-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
        )}>
            <Icon size={24} />
        </div>

        <div className="flex-grow">
            <h3 className={cn("font-bold text-base transition-colors", selected === value ? "text-primary" : "text-foreground")}>{label}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>

        <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ml-2",
            selected === value ? "border-primary bg-primary" : "border-muted-foreground/30"
        )}>
            {selected === value && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
    </div>
);


const SummaryRow = ({ label, value, isHighlight = false }: { label: string; value: string; isHighlight?: boolean; }) => (
    <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn('font-semibold text-sm', isHighlight ? 'text-green-500' : 'text-foreground')}>{value}</p>
    </div>
);

// Wrap default export in Suspense
export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}