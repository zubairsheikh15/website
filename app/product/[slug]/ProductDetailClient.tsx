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

export default function ProductDetailModal({ product, closeModal }: { product: Product, closeModal: () => void }) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const addToCart = async () => {
        if (!session) {
            toast.error('Please login to continue.');
            closeModal();
            router.push('/login');
            return { success: false };
        }
        const { error } = await supabase.from('cart_items').insert({
            product_id: product.id,
            quantity: quantity,
            user_id: session.user.id,
        });
        if (error) {
            toast.error('Error: ' + error.message);
            return { success: false };
        }
        router.refresh();
        return { success: true };
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        const toastId = toast.loading('Adding to cart...');
        const { success } = await addToCart();
        toast.dismiss(toastId);
        if (success) {
            toast.success(`${quantity} of ${product.name} added to cart!`);
        }
        setIsAdding(false);
    };

    const handleBuyNow = async () => {
        setIsBuying(true);
        const toastId = toast.loading('Preparing your order...');
        const { success } = await addToCart();
        toast.dismiss(toastId);
        if (success) {
            closeModal();
            router.push('/checkout');
        }
        setIsBuying(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
            {/* --- Image Column --- */}
            <div className="relative w-full aspect-square md:aspect-auto">
                <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
            </div>

            {/* --- Details Column (with internal scrolling) --- */}
            <div className="flex flex-col p-6 md:p-8 bg-white overflow-hidden">
                {/* --- Header --- */}
                <div className="flex-shrink-0">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-gray tracking-tight mt-1">{product.name}</h1>
                    <div className="flex items-baseline gap-3 mt-4">
                        <p className="text-3xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-xl text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <div className="text-sm font-bold bg-red-100 text-red px-2 py-1 rounded-md">{discount}% OFF</div>}
                    </div>
                </div>

                {/* --- Scrollable Description --- */}
                <div className="flex-grow my-6 pr-4 -mr-4 overflow-y-auto">
                    <p className="text-gray leading-relaxed">{product.description}</p>
                </div>

                {/* --- Footer / Actions (Always visible at the bottom) --- */}
                <div className="flex-shrink-0 mt-auto pt-6 border-t border-lighter-gray">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-dark-gray">Quantity:</p>
                        <div className="flex items-center gap-2 bg-grayBG rounded-full">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray hover:text-primary transition-colors rounded-full"><Minus size={16} /></button>
                            <p className="text-lg font-bold w-8 text-center">{quantity}</p>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray hover:text-primary transition-colors rounded-full"><Plus size={16} /></button>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <Button onClick={handleAddToCart} disabled={isAdding || isBuying} className="flex items-center justify-center gap-2 bg-lightPrimary text-primary hover:bg-light">
                            <ShoppingCart size={20} />
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                        </Button>
                        <Button onClick={handleBuyNow} disabled={isAdding || isBuying} className="flex items-center justify-center gap-2">
                            <Zap size={20} />
                            {isBuying ? 'Redirecting...' : 'Buy Now'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}