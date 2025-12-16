import { CartItem } from "@/lib/types";
import Button from "../ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartSummary({ items }: { items: CartItem[] }) {
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        const total = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
        setSubtotal(total);
    }, [items]);

    // In a real app, shipping would be calculated based on rules from Supabase
    const shipping = subtotal > 500 ? 0 : 40;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 sticky top-24">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span>₹{(subtotal + shipping).toFixed(2)}</span>
            </div>
            <Link href="/checkout">
                <Button>Proceed to Checkout</Button>
            </Link>
        </div>
    )
}