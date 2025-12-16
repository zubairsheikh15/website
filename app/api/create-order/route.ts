import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, cartItems, total, payment } = body;
        const supabase = createClient();

        // Get current user from server-side auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate input
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'No items to order.' }, { status: 400 });
        }

        // Validate total is a positive number
        if (typeof total !== 'number' || total <= 0 || !isFinite(total)) {
            return NextResponse.json({ error: 'Invalid total amount.' }, { status: 400 });
        }

        // Validate quantities
        for (const item of cartItems) {
            if (!item.product_id || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return NextResponse.json({ error: 'Invalid cart item.' }, { status: 400 });
            }
        }

        // Normalize address payload (store as JSON or flattened fields as your schema requires)
        const shippingAddress = address || null;
        const paymentMethod = payment?.method === 'ONLINE' ? 'Paid' : 'COD';

        // Create order
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert([{
                user_id: user.id,
                shipping_address: shippingAddress?.id || null, // column is uuid referencing addresses.id
                total_price: total,
                payment_method: paymentMethod,
                status: paymentMethod === 'Paid' ? 'paid' : 'processing',
            }])
            .select()
            .single();

        if (orderErr) {
            logger.error('Error creating order', orderErr, { userId: user.id });
            return NextResponse.json({ error: 'Failed to create order.' }, { status: 400 });
        }

        // Insert order items
        const orderItems = cartItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: Math.min(item.quantity, 100), // Cap quantity to prevent abuse
            price_at_purchase: item.products?.price ?? 0,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) {
            logger.error('Error inserting order items', itemsErr, { orderId: order.id });
            return NextResponse.json({ error: 'Failed to create order items.' }, { status: 400 });
        }

        return NextResponse.json({ orderId: order.id });
    } catch (e: any) {
        logger.error('Create order API error', e);
        const errorMessage = process.env.NODE_ENV === 'production' 
            ? 'Failed to create order' 
            : e?.message || 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}