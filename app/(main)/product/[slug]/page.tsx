// app/(main)/product/[slug]/page.tsx
'use client';

import { createClient } from '@/lib/supabase-client';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/store/CartContext';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Star, Truck, ShieldCheck, Share2, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data } = await supabase.from('products').select('*').eq('id', params.slug).single();
            setProduct(data);
            setLoading(false);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product.id, quantity);
        toast.success(`added to bag`);
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart(product.id, quantity);
        router.push('/checkout');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Spinner />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <h2 className="text-2xl font-bold">Product not found</h2>
            <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
    );

    // Single image source
    const image = product.image_url;

    // Calculate discount
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    return (
        <div className="min-h-screen pb-20">
            {/* Background Blur */}
            <div className="fixed inset-0 -z-10 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
            <div
                className="fixed top-0 left-0 w-full h-[500px] -z-10 opacity-20 blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, #2563EB, transparent 70%)' }}
            />

            <div className="container mx-auto px-4 md:px-8 max-w-7xl pt-4">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

                    {/* Left: Single Image Hero */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 space-y-6"
                    >
                        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white/50 border border-white/20 shadow-2xl group">
                            <Image
                                src={image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                priority
                                unoptimized
                            />
                            {/* Overlay Controls */}
                            <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:text-red-500 transition-colors">
                                    <Heart size={20} />
                                </button>
                                <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:text-blue-500 transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full lg:w-1/2 flex flex-col justify-center"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                                {product.category || 'Premium'}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                                <Star size={16} fill="currentColor" />
                                <span>4.8 (120 Reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            {product.description || 'Experience the finest quality with our meticulously crafted product, designed to elevate your lifestyle.'}
                        </p>

                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-4xl font-bold text-primary">₹{product.price.toFixed(2)}</span>
                            {product.mrp && product.mrp > product.price && (
                                <>
                                    <span className="text-xl text-muted-foreground line-through decoration-red-500/50 mb-1">
                                        ₹{product.mrp.toFixed(2)}
                                    </span>
                                    <span className="px-2 py-1 bg-red-500/10 text-red-600 text-xs font-bold rounded-lg mb-2">
                                        {discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="h-px w-full bg-border/50 mb-8" />

                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center gap-3 bg-white dark:bg-black/20 border border-border rounded-full px-2 py-2 shadow-sm">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-8 text-center text-xl font-bold tabular-nums">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                                <ShieldCheck size={18} /> In Stock & Ready to Ship
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={handleAddToCart}
                                className="flex-1 py-4 text-lg bg-white text-foreground border-2 border-border hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
                            >
                                Add to Bag
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                className="flex-1 py-4 text-lg shadow-glow"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" /> Buy Now
                            </Button>
                        </div>

                        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-6">
                            <div className="flex items-center gap-2">
                                <Truck size={18} className="text-primary" />
                                <span>Free Delivery over ₹500</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-primary" />
                                <span>1 Year Warranty</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
