// components/ui/SearchBar.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchBarProps {
    onSearch?: () => void;
    autoFocus?: boolean;
    className?: string;
    placeholder?: string;
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): void => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), waitFor);
    };
}

export default function SearchBar({
    onSearch,
    autoFocus = false,
    className,
    placeholder = "Search products..."
}: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isFocused, setIsFocused] = useState(false);
    const [isUpdatingURL, setIsUpdatingURL] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateURL = useCallback((searchTerm: string) => {
        const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));
        const term = searchTerm.trim();
        if (term) {
            currentQuery.set('q', term);
        } else {
            currentQuery.delete('q');
        }
        const search = currentQuery.toString();
        router.replace(`/${search ? `?${search}` : ''}`, { scroll: false });
        setTimeout(() => setIsUpdatingURL(false), 150);
    }, [router, searchParams]);

    const debouncedUpdateURL = useCallback(debounce(updateURL, 400), [updateURL]);

    useEffect(() => {
        if (autoFocus && inputRef.current) inputRef.current.focus();
    }, [autoFocus]);

    useEffect(() => {
        if (!isFocused) setQuery(searchParams.get('q') || '');
    }, [searchParams, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        setIsUpdatingURL(true);
        debouncedUpdateURL(newValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        inputRef.current?.blur();
        onSearch?.();
    };

    const handleClear = () => {
        setQuery('');
        setIsUpdatingURL(true);
        debouncedUpdateURL('');
        inputRef.current?.focus();
    };

    return (
        <div className={cn("relative w-full group", className)}>
            <form onSubmit={handleSubmit} className="relative w-full">
                <div className={cn(
                    "relative flex items-center transition-all duration-300 ease-out rounded-xl overflow-hidden",
                    "bg-muted/50 border border-transparent",
                    isFocused
                        ? "bg-background ring-2 ring-primary/20 border-primary/50 shadow-lg scale-[1.01]"
                        : "hover:bg-muted/80 hover:border-border"
                )}>
                    <Search className={cn(
                        "absolute left-4 text-muted-foreground transition-all duration-300",
                        "h-4 w-4",
                        isFocused ? "text-primary scale-110" : ""
                    )} />

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className={cn(
                            "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70",
                            "pl-11 pr-10 py-2.5",
                            "focus:outline-none",
                            "font-medium"
                        )}
                        autoComplete="off"
                    />

                    <div className="absolute right-3 flex items-center gap-1">
                        <AnimatePresence>
                            {query && !isUpdatingURL && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    type="button"
                                    onClick={handleClear}
                                    className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {isUpdatingURL && (
                            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}