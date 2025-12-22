'use client';

import { CartItem } from "@/lib/types";
import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartCardProps {
    item: CartItem;
    onIncrement: () => void;
    onDecrement: () => void;
    onRemove: () => void;
}

export default function CartCard({ item, onIncrement, onDecrement, onRemove }: CartCardProps) {

    return (
        <div
            // FIX: Replaced 'glass-card' with clean white shadow style
            className={cn(
                "flex items-start gap-4 p-4 rounded-xl",
                "bg-white shadow-md"
            )}
        >
            <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner">
                <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-dark-gray">{item.products.name}</h3>
                <p className="text-sm text-gray-600">
                    ₹{item.products.price.toFixed(2)} each
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-full w-fit mt-3">
                    <button onClick={onDecrement} className="p-2 text-gray-600 hover:text-primary transition-colors rounded-full" aria-label="Decrease quantity">
                        <Minus size={16} />
                    </button>
                    <p className="text-base font-bold w-8 text-center text-dark-gray">{item.quantity}</p>
                    <button onClick={onIncrement} className="p-2 text-gray-600 hover:text-primary transition-colors rounded-full" aria-label="Increase quantity">
                        <Plus size={16} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
                <button onClick={onRemove} className="text-gray-400 hover:text-red" aria-label="Remove item">
                    <X size={20} />
                </button>
                <p className="text-lg font-bold text-primary mt-1">
                    ₹{(item.products.price * item.quantity).toFixed(2)}
                </p>
            </div>
        </div>
    );
}