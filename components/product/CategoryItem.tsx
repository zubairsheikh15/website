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
        currentQuery.delete('q'); // remove search query
        const search = currentQuery.toString();
        const newUrl = `/${search ? `?${search}` : ''}`;

        startTransition(() => {
            router.push(newUrl);
            router.refresh();
        });
    };

    // Get gradient classes for the category
    const getGradientClasses = (catName: string) => {
        switch (catName) {
            case 'medicine':
                return 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600';
            case 'cosmetics':
                return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
            case 'food':
                return 'bg-gradient-to-br from-red-400 via-red-500 to-red-600';
            case 'perfumes':
                return 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600';
            case 'All':
                return 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600';
            default:
                return 'bg-gradient-to-br from-gray-600 to-gray-800';
        }
    };

    const getShadowClass = (catName: string) => {
        switch (catName) {
            case 'medicine':
                return 'shadow-emerald-500/30';
            case 'cosmetics':
                return 'shadow-blue-500/30';
            case 'food':
                return 'shadow-red-500/30';
            case 'perfumes':
                return 'shadow-amber-500/30';
            case 'All':
                return 'shadow-indigo-500/30';
            default:
                return 'shadow-gray-500/30';
        }
    };

    const gradientClass = getGradientClasses(name);
    const shadowClass = getShadowClass(name);

    // Build the className for the button based on selection state
    const baseClasses = 'relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center gpu-accelerated';
    
    // For food category, ensure red background is visible
    const foodStyle = name === 'food' && isSelected 
        ? { background: 'linear-gradient(to bottom right, rgb(248 113 113), rgb(239 68 68), rgb(220 38 38))' }
        : undefined;
    
    const buttonClassName = isSelected
        ? cn(
            baseClasses,
            gradientClass, // Apply gradient class
            'shadow-xl',
            shadowClass,
            'border-2 border-white/30'
        )
        : cn(
            baseClasses,
            'bg-white/98 md:bg-white/95',
            'shadow-lg border border-gray-200/50',
            'group-hover:shadow-xl group-hover:bg-white'
        );

    return (
        <motion.div
            onClick={handleClick}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
                "flex flex-col items-center justify-center gap-2 cursor-pointer group min-w-[64px] md:min-w-[80px]",
                isPending && "opacity-60 cursor-not-allowed pointer-events-none"
            )}
            title={name}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{ pointerEvents: isPending ? 'none' : 'auto' }}
        >
            <motion.div
                className={buttonClassName}
                style={{ ...foodStyle, willChange: 'transform' }}
                animate={{
                    scale: isSelected ? 1.1 : 1,
                    rotate: isSelected ? [0, -5, 5, -5, 0] : 0,
                }}
                transition={{
                    scale: { type: "spring", stiffness: 400, damping: 25, duration: 0.2 },
                    rotate: { duration: 0.3, ease: "easeOut" }
                }}
                whileHover={!isSelected ? { scale: 1.05, y: -2 } : {}}
            >
                {/* Glow effect when selected */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.6, scale: 1.2 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "absolute inset-0 rounded-2xl blur-xl",
                                shadowClass.replace('shadow-', 'bg-').replace('/30', '')
                            )}
                        />
                    )}
                </AnimatePresence>
                
                <motion.div
                    animate={{
                        scale: isSelected ? 1.1 : 1,
                        rotate: isSelected ? 0 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                    style={{ willChange: 'transform' }}
                >
                    <Icon
                        className={cn(
                            'relative z-10 h-7 w-7 md:h-9 md:w-9 transition-colors duration-300',
                            isSelected 
                                ? 'text-white' 
                                : 'text-gray-600 group-hover:text-primary'
                        )}
                        strokeWidth={isSelected ? 2.5 : 2}
                    />
                </motion.div>
            </motion.div>
            <motion.p
                className={cn(
                    'text-xs md:text-sm font-semibold capitalize text-center truncate w-full transition-colors duration-200',
                    isSelected 
                        ? 'text-primary font-bold' 
                        : 'text-gray-600 group-hover:text-primary group-hover:font-semibold'
                )}
                style={{ 
                    WebkitFontSmoothing: 'antialiased',
                    textRendering: 'optimizeLegibility',
                    fontWeight: isSelected ? 700 : 600,
                    willChange: 'transform'
                }}
                animate={{
                    scale: isSelected ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
            >
                {name}
            </motion.p>
        </motion.div>
    );
}