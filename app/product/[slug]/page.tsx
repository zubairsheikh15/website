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
    const [show, setShow] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousPathRef = useRef<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase.from('products').select('*').eq('id', params.slug).single();
            setProduct(data);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    const handleClose = () => {
        if (isNavigating || !show) return; // Prevent double navigation
        setShow(false);
        // Wait for animation to complete before navigating
        // Navigate back to the previous path (the page that was open before modal)
        setTimeout(() => {
            const targetPath = previousPathRef.current || '/';
            router.replace(targetPath);
        }, 350); // Match animation duration
    };

    useEffect(() => {
        // Store the previous path before opening modal
        // This will be used to navigate back without affecting the background
        previousPathRef.current = document.referrer ? new URL(document.referrer).pathname : '/';
        
        setShow(true);
        document.body.style.overflow = 'hidden';
        
        // Push a state to history so back button works
        window.history.pushState({ modal: true }, '');
        
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        
        const handlePopState = () => {
            // When back button is pressed, close the modal
            // Navigate to the previous path to close modal while keeping background
            if (isNavigating || !show) return;
            setShow(false);
            const targetPath = previousPathRef.current || '/';
            setTimeout(() => {
                router.replace(targetPath);
            }, 350);
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', handlePopState);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Detect route changes and close modal
    useEffect(() => {
        // If pathname changes to something other than the current product, hide the modal
        if (show && !pathname.includes(`/product/${params.slug}`)) {
            setShow(false);
            document.body.style.overflow = 'auto';
        }
    }, [pathname, params.slug, show]);

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === dialogRef.current) handleClose();
    };

    // Don't render if navigating away
    if (!show && !pathname.includes(`/product/${params.slug}`)) {
        return null;
    }

    return (
        <div
            ref={dialogRef}
            onClick={onBackdropClick}
            className={`fixed inset-0 z-50 flex items-end md:items-center justify-center transition-colors duration-300 ease-in-out ${show ? 'bg-black/50' : 'bg-transparent'}`}
        >
            <div
                className={`relative bg-white w-full rounded-t-2xl md:rounded-xl shadow-lifted max-w-4xl transition-all ${
                    show 
                        ? 'translate-y-0 opacity-100' 
                        : 'translate-y-full md:translate-y-10 opacity-0'
                }`}
                style={{
                    transitionDuration: '350ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 p-2 md:hidden">
                    <div className="w-12 h-1.5 bg-white/70 rounded-full" />
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 bg-gray-100 rounded-full p-2 text-gray-700 hover:bg-red hover:text-white hover:scale-110 transition-all duration-200 shadow-md"
                    aria-label="Close product details"
                >
                    <X size={20} />
                </button>

                {product ? (
                    <ProductDetailModal
                        product={product}
                        closeModal={handleClose}
                        onNavigate={() => setIsNavigating(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-[70vh] md:h-auto">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
}