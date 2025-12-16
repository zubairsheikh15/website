// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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

    // --- 2. APPLIED Variants TYPE ---
    const mobileMenuVariants: Variants = {
        hidden: {
            opacity: 0,
            y: "-5%",
            transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
        },
        exit: {
            opacity: 0,
            y: "-5%",
            transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                <Link href="/" className="mr-6 flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image src="/icon.png" alt="Zee Crown Logo" width={32} height={32} />
                    <span className="font-bold inline-block text-primary">Zee Crown</span>
                </Link>

                <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
                    {/* Desktop nav links */}
                </nav>

                {/* Icons - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="hidden lg:block w-64">
                        <SearchBar />
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden text-foreground/60 hover:text-foreground/80" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </Button>

                    <Link href="/cart" className="relative text-foreground/60 transition-colors hover:text-foreground/80">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-white text-xs">
                                            {getInitials(profile?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {profile?.full_name || "Zee Crown User"}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center cursor-pointer">
                                        <UserCog className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/my-orders" className="flex items-center cursor-pointer">
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>My Orders</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/addresses" className="flex items-center cursor-pointer">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <span>My Addresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button & Icons */}
                <div className="flex items-center gap-2 md:hidden">
                    <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground/80" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </Button>
                    <Link href="/cart" className="relative text-foreground/60 transition-colors hover:text-foreground/80" onClick={() => setIsMobileMenuOpen(false)}>
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-foreground/60 hover:text-foreground/80"
                        aria-label="Toggle mobile menu"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={isMobileMenuOpen ? 'close' : 'open'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ 
                                duration: 0.25,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            className="absolute top-0 left-0 right-0 h-16 bg-background flex items-center px-3 md:hidden border-b z-40 shadow-lg"
                        >
                            <div className="flex-1">
                                <SearchBar onSearch={() => setIsSearchOpen(false)} autoFocus />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-2 h-10 w-10 active:scale-95 transition-transform duration-200" 
                                onClick={() => setIsSearchOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        key="mobile-menu"
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 pb-6 z-40"
                    >
                        <nav className="flex flex-col gap-1 px-4 pt-4 text-base font-medium">
                            {user ? (
                                <>
                                    <Link href="/profile" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-all duration-200 ease-out"><UserCog className="h-5 w-5 text-gray-500" />Profile</Link>
                                    <Link href="/my-orders" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-all duration-200 ease-out"><Package className="h-5 w-5 text-gray-500" />My Orders</Link>
                                    <Link href="/addresses" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-all duration-200 ease-out"><MapPin className="h-5 w-5 text-gray-500" />My Addresses</Link>
                                    <hr className="my-3 border-gray-100" />
                                    <button
                                        onClick={handleSignOut}
                                        className="text-red-600 hover:bg-red-50 py-3 flex items-center gap-3 rounded-md px-3 text-left w-full transition-all duration-200 ease-out"
                                    >
                                        <LogOut className="h-5 w-5" /> Log out
</button>
                                </> 
                            ) : (
                                <Link href="/login" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-all duration-200 ease-out">Login / Sign Up</Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;