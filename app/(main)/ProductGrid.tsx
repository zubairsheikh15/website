'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { createClient } from '@/lib/supabase-client';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import Spinner from '@/components/ui/Spinner';
import { PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';

const PRODUCTS_PER_PAGE = 10;

const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const gridItemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
};

export default function ProductGrid({
    initialProducts,
}: {
    initialProducts: Product[];
}) {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialProducts.length === PRODUCTS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver>();
    const selectedCategory = searchParams.get('category') || 'All';
    const searchQuery = searchParams.get('q') || '';

    const loadMoreProducts = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const from = page * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;

        let query = supabase.from('products').select('*').range(from, to);
        if (selectedCategory !== 'All') {
            query = query.eq('category', selectedCategory);
        }
        if (searchQuery) {
            query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data: newProducts } = await query.order('created_at', {
            ascending: false,
        });

        if (newProducts && newProducts.length > 0) {
            setProducts((prev) => [...prev, ...newProducts]);
            setPage((prev) => prev + 1);
            if (newProducts.length < PRODUCTS_PER_PAGE) {
                setHasMore(false);
            }
        } else {
            setHasMore(false);
        }
        setLoadingMore(false);
    }, [page, hasMore, loadingMore, selectedCategory, searchQuery, supabase]);

    const lastProductElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreProducts();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMoreProducts, loadingMore]
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setPage(1);
            setHasMore(true);

            let productQuery = supabase
                .from('products')
                .select('*')
                .range(0, PRODUCTS_PER_PAGE - 1);
            if (selectedCategory !== 'All') {
                productQuery = productQuery.eq('category', selectedCategory);
            }
            if (searchQuery) {
                productQuery = productQuery.ilike('name', `%${searchQuery}%`);
            }
            const { data: productData } = await productQuery.order('created_at', {
                ascending: false,
            });
            setProducts(productData || []);
            if (!productData || productData.length < PRODUCTS_PER_PAGE) {
                setHasMore(false);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedCategory, searchQuery, supabase]);

    const textColor = selectedCategory !== 'All' ? 'text-white' : 'text-dark-gray';
    const showUploadCard = selectedCategory === 'All' || selectedCategory === 'medicine';

    return (
        <div>
            <div className="border-t border-white/10 pt-12">
                <h2
                    className={cn(
                        'text-3xl font-bold text-center capitalize transition-colors duration-500',
                        textColor
                    )}
                >
                    {selectedCategory === 'All'
                        ? 'Featured Products'
                        : `${selectedCategory}`}
                </h2>
            </div>
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8"
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
            >
                {loading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))
                    : (
                        <>
                            {showUploadCard && (
                                <motion.div variants={gridItemVariants}>
                                    <UploadPrescriptionCard />
                                </motion.div>
                            )}
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    ref={
                                        products.length === index + 1
                                            ? lastProductElementRef
                                            : null
                                    }
                                    variants={gridItemVariants}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </>
                    )
                }
            </motion.div>
            {loadingMore && <Spinner />}
            {!loading && products.length === 0 && (
                <div className="col-span-full text-center py-16 flex flex-col items-center">
                    <PackageSearch
                        size={64}
                        className={cn(
                            'transition-colors duration-500',
                            selectedCategory !== 'All'
                                ? 'text-white/50'
                                : 'text-gray-300'
                        )}
                    />
                    <h3
                        className={cn(
                            'text-2xl font-bold mt-4 transition-colors duration-500',
                            textColor
                        )}
                    >
                        No Products Found
                    </h3>
                    <p
                        className={cn(
                            'mt-2 transition-colors duration-500',
                            selectedCategory !== 'All' ? 'text-white/70' : 'text-gray-500'
                        )}
                    >
                        Try adjusting your category or search.
                    </p>
                </div>
            )}
        </div>
    );
}