// components/ui/BannerSlider.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Banner } from '@/lib/types';

// FIX: This component now accepts `banners` as a prop
export default function BannerSlider({ banners = [] }: { banners?: Banner[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Ensure banners is always an array
    const safeBanners = Array.isArray(banners) ? banners : [];

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const goToSlide = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        goToSlide((currentIndex + 1) % safeBanners.length);
    }, [currentIndex, safeBanners.length, isTransitioning, goToSlide]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        goToSlide((currentIndex - 1 + safeBanners.length) % safeBanners.length);
    }, [currentIndex, safeBanners.length, isTransitioning, goToSlide]);

    // Auto-advance slides
    useEffect(() => {
        resetTimeout();
        if (safeBanners.length > 1 && !isTransitioning) {
            timeoutRef.current = setTimeout(nextSlide, 5000);
        }
        return () => {
            resetTimeout();
        };
    }, [currentIndex, safeBanners.length, isTransitioning, nextSlide, resetTimeout]);

    // Touch handlers for swipe support
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        
        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (distance > minSwipeDistance) {
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            prevSlide();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!safeBanners || safeBanners.length === 0) {
        return (
            <div className="w-full max-w-5xl mx-auto aspect-video bg-lighter-gray rounded-lg animate-pulse" />
        );
    }

    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-lifted gpu-accelerated border border-white/20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex transition-transform duration-700 ease-smoother"
                style={{ 
                    transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                }}
            >
                {safeBanners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className="flex-shrink-0 w-full aspect-video md:aspect-[21/9] relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
                        <Image
                            src={banner.image_url}
                            alt={`Promotional Banner ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                            className="object-cover"
                            priority={index === 0}
                            unoptimized
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                    </div>
                ))}
            </div>

            {safeBanners.length > 1 && (
                <>
                    {/* Navigation Arrows - Enhanced */}
                    <button
                        onClick={prevSlide}
                        disabled={isTransitioning}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2.5 md:p-3 transition-all duration-300 ease-smooth hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
                        aria-label="Previous banner"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={isTransitioning}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2.5 md:p-3 transition-all duration-300 ease-smooth hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
                        aria-label="Next banner"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Dots Indicator - Enhanced */}
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5 z-10 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        {safeBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                disabled={isTransitioning}
                                className={`rounded-full transition-all duration-300 ease-smoother ${
                                    currentIndex === index 
                                        ? 'w-8 h-2.5 bg-white shadow-lg' 
                                        : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/90 hover:scale-125'
                                }`}
                                style={{ willChange: 'width, background-color, transform' }}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}