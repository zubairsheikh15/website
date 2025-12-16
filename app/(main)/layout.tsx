// app/(main)/layout.tsx
'use client';

// import Footer from '@/components/layout/Footer'; // <-- Footer stays removed
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import Loading from './loading'; // Keep loading for Suspense
import { ProductModalProvider } from '@/components/product/ProductModalProvider';

const categoryBgClasses: { [key: string]: string } = {
    // --- THIS IS THE UPDATED LINE ---
    'All': 'from-grayBG to-lighter-gray', // Explicitly setting "All" to a light grey gradient

    medicine: 'from-[#6EE7B7] to-[#34D399]',   // soft light-green gradient
    cosmetics: 'from-[#93C5FD] to-[#3B82F6]',  // soft light-blue gradient
    food: 'from-[#FCA5A5] to-[#EF4444]',       // soft light-red gradient
    perfumes: 'from-[#FDE68A] to-[#F59E0B]',   // light-golden gradient
};


interface MainLayoutProps {
    children: React.ReactNode;
    modal?: React.ReactNode;
}

// This component uses the search params to dynamically change the background.
function MainLayoutContent({ children, modal }: MainLayoutProps) {
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
                "flex flex-col min-h-screen bg-gradient-to-b transition-colors duration-300 ease-out overflow-x-hidden",
                bgGradient // <-- This will now be the light grey gradient for "All"
            )}
            style={{ willChange: 'background-color' }}
            >

                <Navbar />

                {/*
                  This is correct. No container, no pt-16.
                  Each page (like page.tsx) will add its own padding.
                */}
                <main className="flex-grow py-6">
                    {children}
                    {modal}
                </main>

                {/* Footer is still removed */}
            </div>
        </ProductModalProvider>
    );
}

// The Suspense wrapper is still required because MainLayoutContent uses useSearchParams.
export default function MainLayout({ children, modal }: MainLayoutProps) {
    return (
        <Suspense fallback={<Loading />}>
            <MainLayoutContent modal={modal}>
                {children}
            </MainLayoutContent>
        </Suspense>
    );
}