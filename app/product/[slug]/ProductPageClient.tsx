// app/product/[slug]/ProductPageClient.tsx
'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap, CheckCircle } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { createClient } from '@/lib/supabase-client';
import { useCart } from '@/store/CartContext';
import { logger } from '@/lib/logger';

export default function ProductPageClient({ product }: { product: Product }) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const handleAddToCart = async () => {
        setIsAdding(true);
        if (!session) {
            router.push('/login');
            setIsAdding(false);
            return;
        }

        await addToCart(product.id, quantity);
        const toastId = toast.success(`${quantity} × ${product.name} added to cart!`);

        setTimeout(() => {
            toast.dismiss(toastId);
            router.push('/');
        }, 1000);
    };

    const handleBuyNow = async () => {
        setIsBuying(true);

        // Store item for checkout
        try {
            const buyNowItem = {
                product_id: product.id,
                quantity,
                products: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    mrp: product.mrp,
                },
            };
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
        } catch (e) {
            logger.error('Failed to store Buy Now item', e);
            toast.error('Could not proceed to checkout. Please try again.');
            setIsBuying(false);
            return;
        }

        const checkoutUrl = `/checkout?buyNow=true`;

        if (!session) {
            const redirectUrl = encodeURIComponent(checkoutUrl);
            router.push(`/login?redirect=${redirectUrl}`);
            return;
        }

        // Just navigate to checkout
        router.push(checkoutUrl);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                </div>
                <div className="flex flex-col">
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                        <h1 className="text-3xl lg:text-4xl font-bold text-dark-gray mt-1">{product.name}</h1>
                    </div>
                    <div className="flex items-baseline gap-3 my-4">
                        <p className="text-4xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-xl text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <p className="text-lg font-bold text-red-600">{discount}% OFF</p>}
                    </div>
                    <div className="mt-4 flex-grow">
                        <h2 className="font-bold text-lg mb-2 text-dark-gray">Description</h2>
                        <p className="text-gray-600 leading-relaxed">{product.description || 'No description available for this product.'}</p>
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-lg font-semibold text-dark-gray">Quantity:</p>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full" aria-label="Decrease quantity"><Minus size={18} /></button>
                                <p className="text-lg font-bold w-10 text-center">{quantity}</p>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full" aria-label="Increase quantity"><Plus size={18} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isAdding || isBuying}
                                className="flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                            >
                                <ShoppingCart size={20} />
                                {isAdding ? 'Adding...' : 'Add to Cart'}
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                disabled={isAdding || isBuying}
                                className="flex items-center justify-center gap-2"
                            >
                                <Zap size={20} />
                                {isBuying ? 'Proceeding...' : 'Buy Now'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}