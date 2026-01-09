// components/ui/BannerSlider.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Banner } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BannerSlider({ banners = [] }: { banners?: Banner[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        resetTimeout();
        if (safeBanners.length > 1 && !isTransitioning) {
            timeoutRef.current = setTimeout(nextSlide, 5000);
        }
        return () => resetTimeout();
    }, [currentIndex, safeBanners.length, isTransitioning, nextSlide, resetTimeout]);

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

        if (distance > minSwipeDistance) nextSlide();
        else if (distance < -minSwipeDistance) prevSlide();

        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!safeBanners || safeBanners.length === 0) {
        return <div className="w-full max-w-6xl mx-auto aspect-video md:aspect-[2.4/1] bg-muted/30 rounded-3xl animate-pulse" />;
    }

    return (
        <div
            ref={containerRef}
            className="group relative w-full max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-lifted gpu-accelerated border border-white/20 hover:border-white/40 transition-colors duration-500"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex transition-transform duration-700 ease-in-out" // Smoother easing
                style={{
                    transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
                    willChange: 'transform',
                }}
            >
                {safeBanners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className="flex-shrink-0 w-full aspect-video md:aspect-[2.4/1] relative"
                    >
                        {/* Gradient Overlay for text readability if needed */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                        <Image
                            src={banner.image_url}
                            alt={`Banner ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                            className="object-cover"
                            priority={index === 0}
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {safeBanners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        disabled={isTransitioning}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={isTransitioning}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
                        {safeBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                disabled={isTransitioning}
                                className={cn(
                                    "rounded-full transition-all duration-500 ease-out",
                                    currentIndex === index
                                        ? "w-8 h-2 bg-white shadow-glow"
                                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}