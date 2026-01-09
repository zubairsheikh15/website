// app/(main)/page.tsx

import { Suspense } from 'react';
import { Banner, ProductCardType } from '@/lib/types';
import BannerSliderWrapper from '@/components/ui/BannerSliderWrapper';
import Loading from './loading';
import ProductListClient from './ProductListClient';
import { createClient } from '@/lib/supabase-server';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

const PRODUCTS_PER_PAGE = 10;

interface HomePageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

async function getPageData(category: string, query: string) {
    noStore();
    const supabase = createClient();

    const getBanners = () => {
        let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
        if (category !== 'All') {
            bannerQuery = bannerQuery.in('category', [category, 'All']);
        }
        return bannerQuery.order('sort_order');
    };

    const getProducts = () => {
        const from = 0;
        const to = from + PRODUCTS_PER_PAGE - 1;

        let queryBuilder = supabase
            .from('products')
            .select('id, name, price, mrp, image_url, category')
            .range(from, to);

        if (category !== 'All') {
            queryBuilder = queryBuilder.eq('category', category);
        }

        if (query) {
            queryBuilder = queryBuilder.ilike('name', `%${query}%`);
        }

        return queryBuilder.order('created_at', { ascending: false });
    };

    const [bannerResult, productResult] = await Promise.all([
        getBanners(),
        getProducts()
    ]);

    const products: ProductCardType[] = productResult.data || [];
    const banners: Banner[] = bannerResult.data || [];

    return {
        banners: banners,
        initialProducts: products,
        hasMore: products.length === PRODUCTS_PER_PAGE,
    };
}

async function HomePageContent({ searchParams }: HomePageProps) {
    const selectedCategory = (searchParams?.category as string) || 'All';
    const searchQuery = (searchParams?.q as string) || '';

    const { banners, initialProducts, hasMore } = await getPageData(selectedCategory, searchQuery);

    return (
        <div className="container-width space-y-12 pb-24">
            {!searchQuery && (
                <div className="mt-6 animate-fade-in-up">
                    <BannerSliderWrapper banners={banners} />
                </div>
            )}

            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <ProductListClient
                    initialProducts={initialProducts}
                    initialHasMore={hasMore}
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
}

export default function HomePage(props: HomePageProps) {
    return (
        <Suspense fallback={<Loading />}>
            <HomePageContent {...props} />
        </Suspense>
    );
}