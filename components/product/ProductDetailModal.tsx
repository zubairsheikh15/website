// components/product/ProductDetailModal.tsx
'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/store/CartContext';
import { logger } from '@/lib/logger';

interface ProductDetailModalProps {
    product: Product;
    closeModal: () => void;
    onNavigate?: () => void;
}

export default function ProductDetailModal({ product, closeModal, onNavigate }: ProductDetailModalProps) {
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
            closeModal(); // Close modal first
            // Small delay to allow modal to close before navigation
            setTimeout(() => {
                router.push('/login');
            }, 100);
            setIsAdding(false);
            return;
        }

        await addToCart(product.id, quantity);

        const toastId = toast.success(`${quantity} × ${product.name} added to cart!`);

        setTimeout(() => {
            toast.dismiss(toastId);
            closeModal();
        }, 1000);
    };

    const handleBuyNow = async () => {
        setIsBuying(true);

        // Notify parent that we're navigating
        if (onNavigate) {
            onNavigate();
        }

        // Store item for checkout
        const buyNowItem = {
            product_id: product.id,
            quantity,
            products: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                mrp: product.mrp,
                description: product.description || '',
                category: product.category || '',
            },
        };

        try {
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
        } catch (e) {
            logger.error('Failed to store Buy Now item', e);
            toast.error('Could not proceed to checkout. Please try again.');
            setIsBuying(false);
            return;
        }

        const checkoutUrl = `/checkout?buyNow=true`;

        if (!session) {
            closeModal(); // Close modal first
            // Small delay to allow modal to close before navigation
            setTimeout(() => {
                const redirectUrl = encodeURIComponent(checkoutUrl);
                router.push(`/login?redirect=${redirectUrl}`);
            }, 100);
            setIsBuying(false);
            return;
        }

        // For authenticated users, force immediate navigation
        toast.loading('Redirecting to checkout...', { duration: 500 });

        // Use window.location for immediate navigation
        setTimeout(() => {
            window.location.href = checkoutUrl;
        }, 100);
    };

    return (
        <div className="max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image Section */}
                <div className="relative w-full aspect-square md:aspect-auto md:min-h-[500px] overflow-hidden">
                    <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        priority 
                        className="object-cover"
                    />
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-6 md:p-8 bg-white">
                    {/* Header Section */}
                    <div className="flex-shrink-0">
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                        <h1 className="text-2xl lg:text-3xl font-bold text-dark-gray tracking-tight mt-1">{product.name}</h1>
                        <div className="flex items-baseline gap-3 mt-4">
                            <p className="text-3xl font-bold text-primary">₹{product.price}</p>
                            {product.mrp && product.mrp > product.price && <p className="text-xl text-gray-400 line-through">₹{product.mrp}</p>}
                            {discount > 0 && <div className="text-sm font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">{discount}% OFF</div>}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="my-6">
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Quantity and Actions Section */}
                    <div className="flex-shrink-0 mt-auto pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-dark-gray">Quantity:</p>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full"
                                    disabled={isBuying || isAdding}
                                >
                                    <Minus size={16} />
                                </button>
                                <p className="text-lg font-bold w-8 text-center">{quantity}</p>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full"
                                    disabled={isBuying || isAdding}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
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
                                {isBuying ? 'Redirecting...' : 'Buy Now'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}