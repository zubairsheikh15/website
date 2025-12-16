'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Product } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { motion, Variants } from 'framer-motion'; // --- 1. IMPORTED Variants ---
import { PackageSearch } from 'lucide-react'; // Import the icon

// --- Animation Variants (Copied from page.tsx for consistency) ---
// --- 2. APPLIED Variants TYPE ---
const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
        },
    },
};

// --- 2. APPLIED Variants TYPE ---
const gridItemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 12 }
    },
};
// -----------------------------------------------------------------

export default function SearchPage() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If there's no query, don't search.
        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            setProducts([]); // Clear old results
            const { data } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`); // Search using the query

            setProducts(data || []);
            setLoading(false);
        };

        fetchProducts();
    }, [query, supabase]);

    // --- Dynamic Title Logic ---
    const renderTitle = () => {
        if (!query) {
            return "Search for products";
        }
        if (loading) {
            return `Searching for "${query}"...`;
        }
        const count = products.length;
        const resultText = count === 1 ? 'result' : 'results';
        return `Found ${count} ${resultText} for "${query}"`;
    };

    return (
        // FIX: Added container classes and pt-16 back to this page
        <div className="container mx-auto px-4 sm:px-6 md:px-8 pb-24 space-y-8 pt-16">
            <h1 className="text-3xl font-bold">
                {renderTitle()}
            </h1>

            {/* --- Loading State --- */}
            {loading && (
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {Array.from({ length: 10 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </motion.div>
            )}

            {/* --- Results Found State --- */}
            {!loading && products.length > 0 && (
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={gridItemVariants}
                            layout
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* --- No Results State --- */}
            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16">
                    <PackageSearch size={64} className="text-gray-300" />
                    <h3 className="text-2xl font-bold mt-4">
                        {query ? 'No Products Found' : 'Start a search'}
                    </h3>
                    <p className="mt-2 text-gray-500 max-w-sm">
                        {query
                            ? `We couldn't find any products matching "${query}". Try searching for something else.`
                            : 'Use the search bar in the navigation to find products.'
                        }
                    </p>
                </div>
            )}
        </div>
    )
}