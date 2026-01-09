// app/(main)/layout.tsx
'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';
import { Suspense, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Loading from './loading';
import { ProductModalProvider } from '@/components/product/ProductModalProvider';
import { usePathname, useSearchParams } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

// Stronger, premium gradients for categories
const categoryGradients: { [key: string]: string } = {
    'All': 'from-background via-background to-background',
    'medicine': 'from-emerald-100/80 via-emerald-50/20 to-background dark:from-emerald-900/40',
    'cosmetics': 'from-blue-100/80 via-blue-50/20 to-background dark:from-blue-900/40',
    'food': 'from-red-100/80 via-red-50/20 to-background dark:from-red-900/40',
    'perfumes': 'from-amber-100/80 via-amber-50/20 to-background dark:from-amber-900/40',
};

interface MainLayoutProps {
    children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const category = searchParams.get('category') || 'All';

    // Check if we are on the home page
    const isHomePage = pathname === '/';

    // Get gradient or fallback to default
    const backgroundClass = useMemo(() => {
        return categoryGradients[category] || categoryGradients['All'];
    }, [category]);

    return (
        <ProductModalProvider>
            <div className="relative min-h-screen overflow-x-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-700 ease-in-out">

                {/* Dynamic Category Background - z-0 to sit above body bg but below content */}
                <div className={cn(
                    "fixed inset-0 z-0 w-full h-screen bg-gradient-to-b transition-all duration-1000 ease-in-out",
                    backgroundClass
                )} />

                {/* Additional Decorative Blobs - z-0 */}
                <div className="fixed inset-0 z-0 top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent opacity-40 pointer-events-none" />
                <div className="fixed inset-0 z-0 top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

                {/* Content Wrapper - z-10 to sit above background */}
                <div className="relative z-10 flex flex-col min-h-screen pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
                    <Navbar />

                    <main className="flex-grow py-8 md:py-12 animate-fade-in relative">
                        {/* Conditionally render Back Button on non-home pages */}
                        {!isHomePage && (
                            <div className="container-width mb-0">
                                <BackButton />
                            </div>
                        )}

                        {children}

                        {/* Texture Pattern */}
                        <div className="fixed inset-0 -z-10 bg-[url('/grid-pattern.svg')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />
                    </main>

                    <Footer />
                </div>

                <MobileNav />
            </div>
        </ProductModalProvider>
    );
}

// The Suspense wrapper is still required because MainLayoutContent uses useSearchParams.
export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<Loading />}>
            <MainLayoutContent>
                {children}
            </MainLayoutContent>
        </Suspense>
    );
}