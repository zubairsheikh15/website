'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryItemProps {
    name: string;
    Icon: LucideIcon;
    isSelected: boolean;
}

const categoryGradients: { [key: string]: string } = {
    medicine: 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600',
    cosmetics: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    food: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600',
    perfumes: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600',
    All: 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600',
};

const categoryShadows: { [key: string]: string } = {
    medicine: 'shadow-emerald-500/30',
    cosmetics: 'shadow-blue-500/30',
    food: 'shadow-red-500/30',
    perfumes: 'shadow-amber-500/30',
    All: 'shadow-indigo-500/30',
};

export default function CategoryItem({ name, Icon, isSelected }: CategoryItemProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));
        if (name === 'All') {
            currentQuery.delete('category');
        } else {
            currentQuery.set('category', name);
        }
        currentQuery.delete('q');
        const search = currentQuery.toString();
        const newUrl = `/${search ? `?${search}` : ''}`;

        startTransition(() => {
            router.push(newUrl);
            router.refresh();
        });
    };

    const gradientClass = categoryGradients[name] || 'bg-gradient-to-br from-gray-600 to-gray-800';
    const shadowClass = categoryShadows[name] || 'shadow-gray-500/30';

    const baseClasses = 'relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300';

    // Updated button classes with glass effect for unselected state
    const buttonClassName = isSelected
        ? cn(
            baseClasses,
            gradientClass,
            'shadow-lg border-2 border-white/20',
            shadowClass
        )
        : cn(
            baseClasses,
            'bg-card/50 backdrop-blur-md border border-border', // Glass effect
            'hover:bg-card hover:shadow-md hover:-translate-y-1'
        );

    return (
        <motion.div
            onClick={handleClick}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
                "flex flex-col items-center justify-center gap-1 md:gap-3 cursor-pointer group w-full min-w-0 md:min-w-[88px]",
                isPending && "opacity-60 cursor-not-allowed pointer-events-none"
            )}
            title={name}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <motion.div
                className={buttonClassName}
                animate={{
                    scale: isSelected ? 1.05 : 1,
                    rotate: isSelected ? [0, -3, 3, -3, 0] : 0,
                }}
                transition={{
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    rotate: { duration: 0.4, ease: "easeOut" }
                }}
            >
                <Icon
                    className={cn(
                        'h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-colors duration-300',
                        isSelected
                            ? 'text-white drop-shadow-md'
                            : 'text-muted-foreground group-hover:text-primary'
                    )}
                    strokeWidth={isSelected ? 2.5 : 2}
                />
            </motion.div>

            <p className={cn(
                'text-xs md:text-sm font-medium capitalize text-center truncate w-full transition-colors duration-200',
                isSelected
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground group-hover:text-foreground'
            )}>
                {name}
            </p>
        </motion.div>
    );
}