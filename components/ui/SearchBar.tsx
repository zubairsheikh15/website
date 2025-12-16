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
                {/* Container for focus effect */}
                <div className={cn(
                    "relative flex items-center bg-white border border-gray-300 rounded-lg",
                    "transition-all duration-300 ease-out",
                    "md:rounded-lg",
                    isFocused 
                        ? "ring-2 ring-primary ring-opacity-50 border-transparent shadow-lg scale-[1.01]" 
                        : "hover:border-gray-400",
                    // Mobile specific improvements
                    "active:scale-[0.99] touch-manipulation"
                )}>
                    <Search className={cn(
                        "absolute left-3 text-gray-400 pointer-events-none transition-all duration-300",
                        "h-4 w-4 md:h-4 md:w-4",
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
                            "w-full rounded-lg bg-transparent text-gray-900 placeholder-gray-500",
                            "focus:outline-none",
                            // Mobile optimizations
                            "text-base md:text-sm", // Prevent zoom on iOS (text-base = 16px)
                            "pl-10 pr-10 py-2.5 md:py-2", // Larger touch target on mobile
                            "transition-all duration-300",
                            // Better mobile experience
                            "touch-manipulation"
                        )}
                        aria-label="Search products"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                    {/* --- Icons Container --- */}
                    <div className="absolute right-3 flex items-center h-full gap-2">
                        {query && !isUpdatingURL && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className={cn(
                                    "p-1.5 md:p-1 text-gray-400 hover:text-gray-600",
                                    "active:scale-95 transition-all duration-200",
                                    "touch-manipulation" // Better mobile tap
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