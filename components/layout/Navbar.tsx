// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, MapPin, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import SearchBar from "../ui/SearchBar";
import { motion, AnimatePresence, Variants } from 'framer-motion'; // --- 1. IMPORTED Variants ---
import { usePathname } from "next/navigation";

const Navbar = () => {
    const { user, profile, signOut } = useAuth();
    const { cartCount } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const supabase = createClient();
    const pathname = usePathname();

    const getInitials = (name?: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const handleSignOut = async () => {
        await signOut();
        setIsMobileMenuOpen(false); // Close menu on sign out
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                if (isSearchOpen) setIsSearchOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobileMenuOpen, isSearchOpen]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // --- 2. APPLIED Variants TYPE --- Optimized for performance
    const mobileMenuVariants: Variants = {
        hidden: {
            opacity: 0,
            y: "-5%",
            transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
        },
        exit: {
            opacity: 0,
            y: "-5%",
            transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] }
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <Link 
                    href="/" 
                    className="flex items-center space-x-3 group" 
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <img 
                        src="/logo.png" 
                        alt="Zee Crown Logo" 
                        width={64} 
                        height={64} 
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                        Zee Crown
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium">
                    {/* Desktop nav links can be added here */}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:block w-80">
                        <SearchBar />
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="lg:hidden h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </Button>

                    {/* Cart */}
                    <Link 
                        href="/cart" 
                        className="relative h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                    >
                        <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
                        {cartCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-gray-900"
                            >
                                {cartCount > 99 ? '99+' : cartCount}
                            </motion.span>
                        )}
                    </Link>

                    {/* User Menu */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className="relative h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 p-0"
                                >
                                    <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all">
                                        <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                                            {getInitials(profile?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal px-3 py-3">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">
                                            {profile?.full_name || "Zee Crown User"}
                                        </p>
                                        <p className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer">
                                    <Link href="/profile" className="flex items-center w-full">
                                        <UserCog className="mr-3 h-4 w-4 text-gray-500" />
                                        <span className="text-sm">Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer">
                                    <Link href="/my-orders" className="flex items-center w-full">
                                        <Package className="mr-3 h-4 w-4 text-gray-500" />
                                        <span className="text-sm">My Orders</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer">
                                    <Link href="/addresses" className="flex items-center w-full">
                                        <MapPin className="mr-3 h-4 w-4 text-gray-500" />
                                        <span className="text-sm">My Addresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={handleSignOut} 
                                    className="px-3 py-2.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span className="text-sm">Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-10 px-5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                Login
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-2 md:hidden">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" 
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </Button>
                    <Link 
                        href="/cart" 
                        className="relative h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Toggle mobile menu"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={isMobileMenuOpen ? 'close' : 'open'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                style={{ willChange: 'transform, opacity' }}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <>
                        {/* Search Bar - Enhanced mobile design with smooth transitions */}
                        <motion.div
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ 
                                duration: 0.25,
                                ease: [0.4, 0, 0.2, 1],
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                            className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-gray-900 flex items-center px-3 md:hidden border-b border-gray-200 dark:border-gray-800 z-50 shadow-xl"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <div className="flex-1 flex items-center gap-2">
                                <SearchBar 
                                    onSearch={() => setIsSearchOpen(false)} 
                                    autoFocus 
                                    className="flex-1"
                                    placeholder="Search products..."
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-2 h-11 w-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200 bg-gray-50 dark:bg-gray-800 flex-shrink-0" 
                                onClick={() => setIsSearchOpen(false)}
                                aria-label="Close search"
                            >
                                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                            </Button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop - No blur on mobile for better clarity */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="fixed inset-0 bg-black/30 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ willChange: 'opacity' }}
                        />
                        {/* Menu */}
                        <motion.div
                            key="mobile-menu"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            {/* Close Button - More Visible */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform"
                                    aria-label="Close menu"
                                >
                                    <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                                </Button>
                            </div>
                            <nav className="flex flex-col gap-1 px-4 py-4">
                                {user ? (
                                    <>
                                        <Link 
                                            href="/profile" 
                                            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary py-3 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-3 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <UserCog className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium">Profile</span>
                                        </Link>
                                        <Link 
                                            href="/my-orders" 
                                            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary py-3 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-3 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Package className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium">My Orders</span>
                                        </Link>
                                        <Link 
                                            href="/addresses" 
                                            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary py-3 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-3 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <MapPin className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium">My Addresses</span>
                                        </Link>
                                        <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
                                        <button
                                            onClick={handleSignOut}
                                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 py-3 flex items-center gap-3 rounded-lg px-3 text-left w-full transition-all duration-200"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span className="font-medium">Log out</span>
                                        </button>
                                    </> 
                                ) : (
                                    <Link 
                                        href="/login" 
                                        className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary py-3 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-3 transition-all duration-200 font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login / Sign Up
                                    </Link>
                                )}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;