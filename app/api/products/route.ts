// app/api/products/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const PRODUCTS_PER_PAGE = 10;
const MAX_PAGE = 100; // Prevent excessive pagination

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const selectedCategory = searchParams.get('category') || 'All';
        const searchQuery = searchParams.get('q') || '';
        const pageParam = searchParams.get('page') || '0';
        
        // Validate and sanitize page parameter
        const page = Math.max(0, Math.min(parseInt(pageParam, 10) || 0, MAX_PAGE));
        
        // Sanitize search query (limit length to prevent abuse)
        const sanitizedQuery = searchQuery.slice(0, 100);

        const from = page * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;

        const supabase = createClient();
        let queryBuilder = supabase
            .from('products')
            // Select only the fields for ProductCardType
            .select('id, name, price, mrp, image_url, category')
            .range(from, to);

        if (selectedCategory !== 'All') {
            // Validate category to prevent injection
            const validCategories = ['medicine', 'cosmetics', 'food', 'perfumes'];
            if (validCategories.includes(selectedCategory)) {
                queryBuilder = queryBuilder.eq('category', selectedCategory);
            }
        }
        if (sanitizedQuery) {
            queryBuilder = queryBuilder.ilike('name', `%${sanitizedQuery}%`);
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching products', error, { category: selectedCategory, query: sanitizedQuery });
            throw error;
        }

        return NextResponse.json({
            products: data || [],
            hasMore: data ? data.length === PRODUCTS_PER_PAGE : false
        });

    } catch (error: any) {
        logger.error('Products API error', error);
        // Don't expose internal error details in production
        const errorMessage = process.env.NODE_ENV === 'production' 
            ? 'Failed to fetch products' 
            : error.message;
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}