// components/product/ProductCard.tsx
'use client';

import Image from 'next/image';
import { ProductCardType } from '@/lib/types';
import { Plus, Sparkles } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const ProductCard = memo(function ProductCard({ product }: { product: ProductCardType }) {
    const router = useRouter(); // Import useRouter
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const handleClick = () => {
        router.push(`/product/${product.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative block rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/30 cursor-pointer card-hover transition-all duration-300"
        >
            {/* Image Section */}
            <div className="relative w-full aspect-square overflow-hidden bg-secondary/30">
                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md bg-opacity-90">
                            <Sparkles className="h-3 w-3" />
                            {discount}% OFF
                        </div>
                    </div>
                )}

                <Image
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick Action Button (Visible on Hover) */}
                <div className="absolute bottom-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
                    <div className="bg-white text-primary p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform">
                        <Plus size={20} strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5em] group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">₹{product.price}</span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-muted-foreground line-through decoration-destructive/50">₹{product.mrp}</span>
                            )}
                        </div>
                        {discount > 0 && (
                            <span className="text-[10px] text-green-600 font-medium">
                                Save ₹{product.mrp! - product.price}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProductCard;