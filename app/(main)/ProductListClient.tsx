// app/(main)/ProductListClient.tsx (OPTIMIZED)
'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ProductCardType } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';
import { PackageSearch } from 'lucide-react';
import CategoryItem from '@/components/product/CategoryItem';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

interface ProductListClientProps {
    initialProducts: ProductCardType[];
    initialHasMore: boolean;
    textColor: string;
    selectedCategory: string;
    searchQuery: string;
}

// Memoized components
const MemoizedProductCard = memo(ProductCard);
const MemoizedUploadCard = memo(UploadPrescriptionCard);

export default function ProductListClient({
    initialProducts,
    initialHasMore,
    textColor,
    selectedCategory,
    searchQuery
}: ProductListClientProps) {
    const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Reset when filters change
    useEffect(() => {
        setProducts(initialProducts);
        setPage(0);
        setHasMore(initialHasMore);
        setLoading(false);
        loadingRef.current = false;

        // Cancel any in-flight requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Smooth scroll to top when category/search changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedCategory, searchQuery, initialProducts, initialHasMore]);

    // Load more products
    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore || loading) {
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        loadingRef.current = true;
        const nextPage = page + 1;
        setLoading(true);

        // Create new abort controller
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const params = new URLSearchParams({
                category: selectedCategory,
                q: searchQuery,
                page: nextPage.toString(),
            });

            const res = await fetch(`/api/products?${params}`, {
                cache: 'no-store',
                signal: controller.signal,
            });

            if (!res.ok) throw new Error('Fetch failed');

            const data = await res.json();

            if (data.products && data.products.length > 0) {
                // Use functional update for better performance
                setProducts(prev => [...prev, ...data.products]);
                setPage(nextPage);
                setHasMore(data.hasMore !== false);
            } else {
                setHasMore(false);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                logger.error('Load error', err);
                setHasMore(false);
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
                loadingRef.current = false;
            }
        }
    }, [hasMore, page, selectedCategory, searchQuery, loading]);

    // Intersection Observer - optimized for infinite scroll
    useEffect(() => {
        const target = observerTarget.current;
        if (!target || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingRef.current && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                rootMargin: '400px', // Load earlier for smooth experience
                threshold: 0.01
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    // Fallback: Manual scroll handler for infinite scroll
    useEffect(() => {
        if (!hasMore || loadingRef.current) return;

        const handleScroll = () => {
            if (loadingRef.current || !hasMore || loading) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            // Load more when user is 600px from bottom
            if (scrollHeight - scrollTop - clientHeight < 600) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore, hasMore, loading]);

    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');

    return (
        <div className="space-y-8 animate-fade-in-up relative" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', backfaceVisibility: 'hidden', willChange: 'auto' }}>
            {/* Categories - Hide when searching with smooth transition */}
            <AnimatePresence mode="wait">
                {!searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ 
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                            staggerChildren: 0.05
                        }}
                        className="grid grid-cols-5 gap-x-3 gap-y-4 px-2 overflow-hidden"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', willChange: 'auto' }}
                    >
                        {categories.map((cat, index) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ 
                                    duration: 0.2,
                                    delay: index * 0.05,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                style={{ willChange: 'transform, opacity' }}
                            >
                                <CategoryItem
                                    name={cat.name}
                                    Icon={cat.icon}
                                    isSelected={selectedCategory === cat.name && !searchQuery}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Products Grid - Enhanced with smooth transitions */}
            <motion.div 
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6"
                layout
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
                <AnimatePresence mode="popLayout">
                    {showUploadCard && (
                        <motion.div
                            key="upload-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ 
                                duration: 0.25,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            layout
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <MemoizedUploadCard />
                        </motion.div>
                    )}

                    {products.map((product, index) => (
                        <motion.div
                            key={`${product.id}-${index}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ 
                                duration: 0.2,
                                delay: Math.min((index + (showUploadCard ? 1 : 0)) * 0.02, 0.2),
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            layout
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <MemoizedProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Load More Trigger - Enhanced with transitions */}
            <AnimatePresence>
                {hasMore && (
                    <motion.div
                        ref={observerTarget}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-40 flex flex-col items-center justify-center gap-4 py-8 min-h-[160px]"
                        style={{ minHeight: '160px' }}
                    >
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <Spinner />
                                <p className="text-sm text-gray-500 animate-pulse">Loading more products...</p>
                            </motion.div>
                        )}
                        {!loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className="h-1 w-20 bg-gray-200 rounded-full"
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* End of results message */}
            <AnimatePresence>
                {!hasMore && products.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-8"
                    >
                        <p className="text-sm text-gray-500">
                            You've reached the end! 🎉
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            <AnimatePresence>
                {products.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="text-center py-16 space-y-4"
                    >
                        <PackageSearch
                        size={48}
                        className={cn(
                            textColor === 'text-white'
                                ? 'text-white/50'
                                : 'text-gray-300'
                        )}
                    />
                    <div>
                        <h3 className={cn('text-xl font-bold', textColor)}>
                            No Products Found
                        </h3>
                        <p className={cn(
                            'mt-2 text-sm',
                            textColor === 'text-white'
                                ? 'text-white/70'
                                : 'text-gray-500'
                        )}>
                            Try adjusting your filters
                        </p>
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}