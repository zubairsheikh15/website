'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/store/authStore';
import { CartItem } from '@/lib/types';
import { logger } from '@/lib/logger';

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { session } = useAuthStore();
    const supabase = createClient();

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Fetch cart items
    const fetchCartItems = async () => {
        if (!session?.user) {
            setCartItems([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .select('id, quantity, products(*)')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: true });

            if (error) {
                logger.error('Error fetching cart items', error);
            } else {
                setCartItems((data || []) as unknown as CartItem[]);
            }
        } catch (error) {
            logger.error('Error fetching cart items', error);
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!session?.user) return;

        try {
            // Check if item already exists in cart
            const existingItem = cartItems.find(item => item.product_id === productId);
            
            if (existingItem) {
                await updateQuantity(existingItem.id, existingItem.quantity + quantity);
            } else {
                const { error } = await supabase
                    .from('cart_items')
                    .insert({
                        user_id: session.user.id,
                        product_id: productId,
                        quantity
                    });

                if (error) {
                    logger.error('Error adding to cart', error);
                } else {
                    await fetchCartItems();
                }
            }
        } catch (error) {
            logger.error('Error adding to cart', error);
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId: string) => {
        if (!session?.user) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', itemId)
                .eq('user_id', session.user.id);

            if (error) {
                logger.error('Error removing from cart', error);
            } else {
                await fetchCartItems();
            }
        } catch (error) {
            logger.error('Error removing from cart', error);
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!session?.user) return;

        if (quantity <= 0) {
            await removeFromCart(itemId);
            return;
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', itemId)
                .eq('user_id', session.user.id);

            if (error) {
                logger.error('Error updating quantity', error);
            } else {
                await fetchCartItems();
            }
        } catch (error) {
            logger.error('Error updating quantity', error);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        if (!session?.user) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', session.user.id);

            if (error) {
                logger.error('Error clearing cart', error);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            logger.error('Error clearing cart', error);
        }
    };

    // Fetch cart items when session changes
    useEffect(() => {
        fetchCartItems();
    }, [session]);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
