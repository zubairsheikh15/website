// components/ui/SearchBar.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    onSearch?: () => void;
    autoFocus?: boolean;
    className?: string;
    placeholder?: string;
}

// Debounce function (no changes needed here)
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<F>): void => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, waitFor);
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
        // Set timeout to ensure spinner shows for a minimum duration for visual feedback
        setTimeout(() => setIsUpdatingURL(false), 150); // Shorter delay after navigation
    }, [router, searchParams]);

    const debouncedUpdateURL = useCallback(debounce(updateURL, 400), [updateURL]);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        // Only update query state from URL if the input is NOT currently focused
        // This prevents the URL change (caused by debouncing) from resetting the input while typing
        if (!isFocused) {
            setQuery(searchParams.get('q') || '');
        }
    }, [searchParams, isFocused]); // Add isFocused dependency

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        setIsUpdatingURL(true);
        debouncedUpdateURL(newValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        inputRef.current?.blur();
        // Update URL immediately on submit if needed, or rely on debounce
        // updateURL(query); // Uncomment if immediate update on Enter is desired
        onSearch?.();
    };

    const handleClear = () => {
        setQuery('');
        setIsUpdatingURL(true);
        debouncedUpdateURL('');
        inputRef.current?.focus();
    };

    return (
        <div className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative w-full">
                {/* Container for focus effect - Enhanced mobile styling */}
                <div className={cn(
                    "relative flex items-center bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl",
                    "transition-all duration-300 ease-out",
                    "md:bg-white md:border md:border-gray-300 md:rounded-lg",
                    isFocused 
                        ? "ring-2 ring-primary ring-opacity-60 border-primary shadow-lg bg-white dark:bg-gray-900 scale-[1.01]" 
                        : "hover:border-gray-300 dark:hover:border-gray-600",
                    // Mobile specific improvements
                    "active:scale-[0.98] touch-manipulation",
                    // Better mobile appearance
                    "md:active:scale-100"
                )}>
                    <Search className={cn(
                        "absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none transition-all duration-200",
                        "h-5 w-5 md:h-4 md:w-4",
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
                            "w-full rounded-xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                            "focus:outline-none",
                            // Mobile optimizations - Larger and more comfortable
                            "text-base md:text-sm", // Prevent zoom on iOS (text-base = 16px)
                            "pl-12 pr-12 py-3.5 md:py-2 md:pl-10 md:pr-10", // Larger touch target on mobile
                            "transition-all duration-200",
                            // Better mobile experience
                            "touch-manipulation",
                            // Font weight for better readability
                            "font-medium md:font-normal"
                        )}
                        aria-label="Search products"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                    {/* --- Icons Container - Enhanced mobile --- */}
                    <div className="absolute right-4 md:right-3 flex items-center h-full gap-2">
                        {query && !isUpdatingURL && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className={cn(
                                    "p-2 md:p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                                    "active:scale-90 transition-all duration-200 rounded-full",
                                    "touch-manipulation bg-gray-200/50 dark:bg-gray-700/50 md:bg-transparent",
                                    "hover:bg-gray-300/70 dark:hover:bg-gray-600/70"
                                )}
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5 md:h-4 md:w-4" />
                            </button>
                        )}
                        {isUpdatingURL && (
                            <Loader2 className="h-5 w-5 md:h-4 md:w-4 text-primary animate-spin" />
                        )}
                    </div>
                    {/* --- End Icons Container --- */}
                </div>
            </form>
        </div>
    );
}