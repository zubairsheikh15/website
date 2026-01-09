// components/cart/CartCard.tsx
'use client';

import { CartItem } from "@/lib/types";
import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CartCardProps {
    item: CartItem;
    onIncrement: () => void;
    onDecrement: () => void;
    onRemove: () => void;
}

export default function CartCard({ item, onIncrement, onDecrement, onRemove }: CartCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="group relative flex items-start gap-4 p-4 rounded-3xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-sm hover:shadow-glow transition-all duration-300"
        >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner">
                <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    unoptimized
                />
            </div>
            <div className="flex-grow flex flex-col justify-between min-h-[6rem] sm:min-h-[7rem]">
                <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-1">{item.products.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        ₹{item.products.price.toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full px-1 py-1 shadow-inner h-9">
                        <button
                            onClick={onDecrement}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-black text-foreground hover:text-primary shadow-sm hover:scale-110 transition-all border border-transparent hover:border-primary/20"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                        <button
                            onClick={onIncrement}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-black text-foreground hover:text-primary shadow-sm hover:scale-110 transition-all border border-transparent hover:border-primary/20"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                            ₹{(item.products.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-2 text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Remove item"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
}