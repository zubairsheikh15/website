// app/(main)/my-orders/[orderId]/page.tsx
import { createClient } from '@/lib/supabase-server';
import OrderDetailView from '@/components/orders/OrderDetailView';
import { notFound } from 'next/navigation';
import { Order } from '@/lib/types';

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
    const supabase = createClient();

    // Updated Query: Joins the orders table with the addresses table
    // The foreign key is shipping_address, and we are aliasing the
    // resulting object as shipping_address.
    const { data: order } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*, products(*)),
            shipping_address:addresses(*) 
        `) //
        .eq('id', params.orderId)
        .single();

    if (!order) {
        notFound();
    }

    // We cast here to satisfy TypeScript because the join changes the 
    // shape of shipping_address from a 'uuid' to an 'Address' object.
    return <OrderDetailView order={order as unknown as Order} />;
}