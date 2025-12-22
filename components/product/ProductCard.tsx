// components/product/ProductCard.tsx
'use client';

import Image from 'next/image';
import { ProductCardType } from '@/lib/types';
import { Plus, Sparkles } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useProductModal } from './ProductModalProvider';
import { createClient } from '@/lib/supabase-client';

const ProductCard = memo(function ProductCard({ product }: { product: ProductCardType }) {
    const { openModal } = useProductModal();
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const handleClick = async () => {
        // Fetch full product details
        const supabase = createClient();
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('id', product.id)
            .single();
        
        if (data) {
            openModal(data);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group relative block rounded-2xl overflow-hidden",
                "bg-white shadow-md cursor-pointer",
                "card-hover gpu-accelerated",
                "border border-gray-100/50",
                "animate-scale-in"
            )}
            style={{ animationDelay: `${Math.random() * 0.2}s` }}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
            
            {/* Image container with enhanced effects */}
            <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {discount > 0 && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {discount}% OFF
                        </div>
                    </div>
                )}
                <div className="relative w-full h-full">
                    <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        unoptimized
                        loading="lazy"
                    />
                </div>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            </div>
            
            {/* Content section with enhanced styling */}
            <div className="relative p-4 bg-white z-10">
                <h3 className="text-sm font-semibold truncate text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">₹{product.price}</span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                            )}
                        </div>
                        {discount > 0 && (
                            <span className="text-[10px] text-green-600 font-medium mt-0.5">
                                Save ₹{product.mrp! - product.price}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-br from-primary to-primary-hover p-2.5 rounded-full text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                            <Plus size={18} className="transition-transform duration-300" />
                        </div>
                        {/* Ripple effect */}
                        <div className="absolute inset-0 bg-primary rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping" />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProductCard;