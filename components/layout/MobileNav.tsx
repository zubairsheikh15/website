// components/layout/MobileNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/CartContext';
import { motion } from 'framer-motion';

export default function MobileNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();

    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: Home
        },
        {
            name: 'Search',
            href: '/search', // Assuming you have a dedicated search page or just uses modal logic elsewhere, but for now a link
            icon: Search
        },
        {
            name: 'Categories',
            href: '/categories', // Placeholder or section
            icon: Grid
        },
        {
            name: 'Cart',
            href: '/cart',
            icon: ShoppingCart,
            badge: cartCount
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User
        }
    ];

    // Hide on specific routes if needed (e.g., inside checkout)
    const shouldHide = pathname.startsWith('/checkout');
    if (shouldHide) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
            {/* Glass Container */}
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50" />

            <nav className="relative flex justify-around items-center h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform duration-200",
                                isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            <div className="relative p-1">
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn("transition-colors duration-300")}
                                    />
                                </motion.div>

                                {item.badge !== undefined && item.badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-black"
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </motion.span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-colors duration-300",
                                isActive ? "font-bold" : ""
                            )}>
                                {item.name}
                            </span>

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-indicator"
                                    className="absolute -top-[1px] w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
