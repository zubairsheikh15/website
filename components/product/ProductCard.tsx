// components/product/ProductCard.tsx
'use client';

import Image from 'next/image';
import { ProductCardType } from '@/lib/types';
import { Plus } from 'lucide-react';
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
                "group block rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer",
                "hover:shadow-md"
            )}
        >
            <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        {discount}% OFF
                    </div>
                )}
                <Image
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-gray-900">{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <div>
                        <span className="text-base font-bold text-primary">₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
                        )}
                    </div>
                    <div className="bg-gray-100 p-1.5 rounded-full text-gray-700 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProductCard;