// app/(main)/layout.tsx
'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import Loading from './loading'; // Keep loading for Suspense
import { ProductModalProvider } from '@/components/product/ProductModalProvider';

const categoryBgClasses: { [key: string]: string } = {
    'All': 'from-gray-50 via-gray-100 to-gray-50', // Elegant light grey gradient

    medicine: 'from-emerald-50 via-green-50 to-emerald-100',   // soft light-green gradient
    cosmetics: 'from-blue-50 via-indigo-50 to-blue-100',  // soft light-blue gradient
    food: 'from-red-50 via-rose-50 to-red-100',       // soft light-red gradient
    perfumes: 'from-amber-50 via-yellow-50 to-amber-100',   // light-golden gradient
};


interface MainLayoutProps {
    children: React.ReactNode;
    modal?: React.ReactNode;
}

// This component uses the search params to dynamically change the background.
function MainLayoutContent({ children, modal }: MainLayoutProps & { modal?: React.ReactNode }) {
    const searchParams = useSearchParams();

    // This correctly defaults to 'All'
    const selectedCategory = useMemo(() => searchParams.get('category') || 'All', [searchParams]);

    // This logic will now pick up the new 'All' key
    const bgGradient = selectedCategory
        ? (categoryBgClasses[selectedCategory] || 'from-grayBG to-gray-50') // Fallback is default grey
        : 'from-grayBG to-gray-50';

    return (
        <ProductModalProvider>
            <div className={cn(
                "flex flex-col min-h-screen bg-gradient-to-br transition-all duration-500 ease-smoother overflow-x-hidden",
                bgGradient, // <-- This will now be the light grey gradient for "All"
                "relative"
            )}
            style={{ willChange: 'background-color' }}
            >
                {/* Animated background overlay - Hidden on mobile to prevent blur */}
                <div className="hidden md:block fixed inset-0 -z-10 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
                </div>

                <Navbar />

                {/*
                  This is correct. No container, no pt-16.
                  Each page (like page.tsx) will add its own padding.
                */}
                <main className="flex-grow py-6">
                    {children}
                    {modal}
                </main>

                <Footer />
            </div>
        </ProductModalProvider>
    );
}

// The Suspense wrapper is still required because MainLayoutContent uses useSearchParams.
export default function MainLayout({ children, modal }: MainLayoutProps & { modal?: React.ReactNode }) {
    return (
        <Suspense fallback={<Loading />}>
            <MainLayoutContent modal={modal}>
                {children}
            </MainLayoutContent>
        </Suspense>
    );
}