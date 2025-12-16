'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Product } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import ProductDetailModal from '@/components/product/ProductDetailModal';

export default function ProductModal({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [product, setProduct] = useState<Product | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        if (isClosing) return; // Prevent multiple close calls
        setIsClosing(true);
        // Wait for animation to complete before navigating
        // Navigate to the parent route (remove /product/[slug] from URL)
        // This will close the modal while keeping the background page
        setTimeout(() => {
            // Get the base path (everything before /product/[slug])
            const basePath = pathname.replace(`/product/${params.slug}`, '') || '/';
            router.replace(basePath);
        }, 350); // Match animation duration
    };

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase.from('products').select('*').eq('id', params.slug).single();
            setProduct(data);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    // Handle browser back button
    useEffect(() => {
        // Push a state to history so back button works
        window.history.pushState({ modal: true }, '');

        const handlePopState = () => {
            // When back button is pressed, close the modal
            // The popstate event means the history state was popped
            // We'll navigate to the base path to close the modal while keeping background
            if (!isClosing) {
                setIsClosing(true);
                // Get the base path (everything before /product/[slug])
                // For parallel routes, navigating to base path closes modal without affecting background
                const basePath = pathname.replace(`/product/${params.slug}`, '') || '/';
                setTimeout(() => {
                    router.replace(basePath);
                }, 350);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router, isClosing, pathname, params.slug]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === dialogRef.current) handleClose();
    };

    return (
        <div
            ref={dialogRef}
            onClick={onBackdropClick}
            className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
                backgroundColor: isClosing ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <div 
                className="relative bg-white w-full rounded-t-2xl md:rounded-xl md:max-w-4xl md:mb-8 shadow-lifted"
                style={{
                    animation: isClosing 
                        ? 'slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1)' 
                        : 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    maxHeight: '90vh',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 p-2 md:hidden">
                    <div className="w-12 h-1.5 bg-white/70 rounded-full" />
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 bg-gray-100 rounded-full p-2 text-gray-700 hover:bg-red hover:text-white transition-colors shadow-md"
                    aria-label="Close product details"
                >
                    <X size={20} />
                </button>

                {product && (
                    <ProductDetailModal product={product} closeModal={handleClose} />
                )}
                {!product && (
                    <div className="flex items-center justify-center w-full h-[70vh] md:h-auto">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
}