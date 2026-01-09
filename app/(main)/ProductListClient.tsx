// app/(main)/ProductListClient.tsx
'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, memo } from 'react';
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
    selectedCategory: string;
    searchQuery: string;
}

// Memoized components
const MemoizedProductCard = memo(ProductCard);
const MemoizedUploadCard = memo(UploadPrescriptionCard);

export default function ProductListClient({
    initialProducts,
    initialHasMore,
    selectedCategory,
    searchQuery
}: ProductListClientProps) {
    // State initialization
    const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    // Refs
    const observerTarget = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isRestoringRef = useRef(false);

    // KEY GEN: Generate a unique key for the current view
    const getViewKey = useCallback(() => {
        return `viewState_${selectedCategory}_${searchQuery}`;
    }, [selectedCategory, searchQuery]);

    // Handle manual scroll restoration setting as early as possible
    useLayoutEffect(() => {
        if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }, []);

    // RESTORE STATE: On mount or param change, try to load from cache
    useEffect(() => {
        const key = getViewKey();
        const cached = sessionStorage.getItem(key);

        console.log('[Restore] Checking cache for key:', key, cached ? 'Found' : 'Not Found');

        if (cached) {
            try {
                const data = JSON.parse(cached);
                // Only restore if we have valid data and products
                if (data && Array.isArray(data.products) && data.products.length > 0) {
                    console.log('[Restore] Restoring state:', data.products.length, 'products, page:', data.page, 'scrollY:', data.scrollY);

                    isRestoringRef.current = true;
                    setProducts(data.products);
                    setPage(data.page || 0);
                    setHasMore(data.hasMore);

                    // Force immediate scroll attempt in case DOM is ready
                    if (data.scrollY) {
                        window.scrollTo({ top: data.scrollY, behavior: 'auto' });
                    }

                    // Robust scroll restoration loop - try for longer
                    const targetScroll = data.scrollY || 0;
                    let attempts = 0;
                    const maxAttempts = 50; // Try for ~5 seconds

                    const attemptScroll = () => {
                        // Always try to scroll - browser will clamp if too short
                        window.scrollTo({ top: targetScroll, behavior: 'auto' });

                        const currentScroll = window.scrollY;
                        const dist = Math.abs(currentScroll - targetScroll);

                        // Only log periodically to reduce spam
                        if (attempts % 5 === 0) {
                            console.log(`[Restore] Attempt ${attempts}: Target ${targetScroll}, Current ${currentScroll}, Dist ${dist}`);
                        }

                        // Success condition: We are close enough
                        if (dist < 50) {
                            console.log('[Restore] Success!');
                            isRestoringRef.current = false;
                            return;
                        }

                        attempts++;
                        if (attempts < maxAttempts) {
                            requestAnimationFrame(() => setTimeout(attemptScroll, 100));
                        } else {
                            console.log('[Restore] Max attempts reached. Final position:', window.scrollY);
                            isRestoringRef.current = false;
                        }
                    };

                    // Start loop
                    requestAnimationFrame(() => setTimeout(attemptScroll, 100));
                    return;
                }
            } catch (e) {
                console.error("Failed to restore state", e);
            }
        }

        // No cache: Default behavior
        console.log('[Restore] No cache found, using initial props');
        isRestoringRef.current = false;

        // Only reset to initial props if we don't have them matching current
        // (This check avoids unnecessary re-renders if products are already initial)
        setProducts(initialProducts);
        setPage(0);
        setHasMore(initialHasMore);

        window.scrollTo({ top: 0, behavior: 'smooth' });

    }, [getViewKey, initialProducts, initialHasMore]);

    // SAVE STATE: Save current state to sessionStorage before unmounting or changing params
    useEffect(() => {
        const handleSave = () => {
            // Guard: Don't save if restoring or if scroll is at top (likely glitch if we have data)
            // Increased guard threshold to ensure we don't save bad state during glitchy loads
            if (isRestoringRef.current && window.scrollY < 50) {
                console.log('[Save] Skipping save - restoration in progress');
                return;
            }

            const key = getViewKey();
            const stateToSave = {
                products,
                page,
                hasMore,
                scrollY: window.scrollY
            };
            console.log('[Save] Saving state for key:', key, stateToSave);
            sessionStorage.setItem(key, JSON.stringify(stateToSave));
        };

        // Save on Cleanup (unmount or dependency change)
        return () => {
            handleSave();
        };
    }, [getViewKey, products, page, hasMore]);

    // Visibility change listener
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                if (isRestoringRef.current && window.scrollY < 50) return;

                const key = getViewKey();
                const stateToSave = {
                    products,
                    page,
                    hasMore,
                    scrollY: window.scrollY
                };
                sessionStorage.setItem(key, JSON.stringify(stateToSave));
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [getViewKey, products, page, hasMore]);


    // Load more products
    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore || loading) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        loadingRef.current = true;
        const nextPage = page + 1;
        setLoading(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const params = new URLSearchParams({
                category: selectedCategory,
                q: searchQuery,
                page: nextPage.toString(),
            });

            const res = await fetch(`/api/products?${params}`, {
                cache: 'force-cache',
                headers: { 'Cache-Control': 'max-age=300' },
                signal: controller.signal,
            });

            if (!res.ok) throw new Error('Fetch failed');

            const data = await res.json();

            if (data.products && data.products.length > 0) {
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

    // Intersection Observer
    useEffect(() => {
        const target = observerTarget.current;
        if (!target || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingRef.current && hasMore && !loading) {
                    loadMore();
                }
            },
            { rootMargin: '400px', threshold: 0.01 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');

    return (
        <div className="space-y-10 animate-fade-in-up relative pb-20">
            {/* Categories */}
            <AnimatePresence mode="wait">
                {!searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-5 gap-1 md:flex md:flex-wrap md:justify-center md:gap-4 py-2 px-2 w-full"
                    >
                        {categories.map((cat, index) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
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

            {/* Products Grid */}
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                layout
                transition={{ duration: 0.2 }}
            >
                <AnimatePresence mode="popLayout">
                    {showUploadCard && (
                        <motion.div
                            key="upload-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <MemoizedUploadCard />
                        </motion.div>
                    )}

                    {products.map((product, index) => (
                        <motion.div
                            key={`${product.id}-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.02 }}
                            layout
                        >
                            <MemoizedProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Load More / End Message */}
            <AnimatePresence>
                {hasMore ? (
                    <motion.div
                        ref={observerTarget}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center py-8"
                    >
                        {loading && (
                            <div className="flex flex-col items-center gap-2">
                                <Spinner />
                                <span className="text-sm text-muted-foreground">Loading more...</span>
                            </div>
                        )}
                    </motion.div>
                ) : products.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10"
                    >
                        <p className="text-muted-foreground text-sm font-medium bg-muted/30 inline-block px-4 py-2 rounded-full">
                            You've seen it all! 🎉
                        </p>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Empty State */}
            {products.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-muted/50 p-6 rounded-full mb-4">
                        <PackageSearch size={48} className="text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No Products Found</h3>
                    <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                        We couldn't find matches for "{searchQuery}". Try adjusting your filters.
                    </p>
                </div>
            )}
        </div>
    );
}