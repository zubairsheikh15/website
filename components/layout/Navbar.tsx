// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, LogOut, Package, MapPin, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from "next/navigation";

const Navbar = () => {
    const { user, profile, signOut } = useAuth();
    const { cartCount } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        setIsMobileMenuOpen(false);
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
        <header className="sticky top-0 z-50 w-full glass-nav">
            <div className="container-width flex h-16 items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center space-x-3 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <img
                            src="/logo.png"
                            alt="Zee Crown Logo"
                            className="w-7 h-7 object-contain"
                        />
                    </div>
                    <span className="font-heading font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                        Zee Crown
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium text-muted-foreground">
                    {/* Links can go here in future */}
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
                        className="lg:hidden h-10 w-10 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                    >
                        <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-colors" />
                        {cartCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-background"
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
                                    className="relative h-10 w-10 rounded-full hover:bg-transparent p-0"
                                >
                                    <Avatar className="h-10 w-10 border-2 border-border hover:border-primary transition-all">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {getInitials(profile?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 mt-2 glass-panel border-white/20" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal px-3 py-3">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-foreground">
                                            {profile?.full_name || "Zee Crown User"}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                    <Link href="/profile" className="flex items-center w-full">
                                        <UserCog className="mr-3 h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                    <Link href="/my-orders" className="flex items-center w-full">
                                        <Package className="mr-3 h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">My Orders</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                    <Link href="/addresses" className="flex items-center w-full">
                                        <MapPin className="mr-3 h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">My Addresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="px-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
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
                                className="h-10 px-6 rounded-full font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300"
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
                        className="h-10 w-10 rounded-xl hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <Link
                        href="/cart"
                        className="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-background">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="h-10 w-10 rounded-xl hover:bg-accent hover:text-accent-foreground"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={isMobileMenuOpen ? 'close' : 'open'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-md flex items-center px-4 md:hidden border-b border-border z-50 shadow-lg"
                    >
                        <div className="flex-1 flex items-center gap-3">
                            <SearchBar
                                onSearch={() => setIsSearchOpen(false)}
                                autoFocus
                                className="flex-1"
                                placeholder="Search products..."
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl bg-accent/50 hover:bg-accent"
                                onClick={() => setIsSearchOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            key="mobile-menu"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-xl z-50 rounded-b-2xl overflow-hidden"
                        >
                            <nav className="flex flex-col gap-1 p-4">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 mb-2 bg-accent/50 rounded-xl flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-primary/20">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {getInitials(profile?.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{profile?.full_name}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                                            </div>
                                        </div>

                                        {[
                                            { href: '/profile', icon: UserCog, label: 'Profile' },
                                            { href: '/my-orders', icon: Package, label: 'My Orders' },
                                            { href: '/addresses', icon: MapPin, label: 'My Addresses' },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <item.icon className="h-5 w-5 opacity-70" />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        ))}

                                        <div className="my-2 border-t border-border/50" />
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive w-full transition-all duration-200"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span className="font-medium">Log out</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-soft hover:shadow-glow transition-all duration-300"
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