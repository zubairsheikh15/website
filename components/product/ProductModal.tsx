'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductDetailModal from './ProductDetailModal';

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(prev => {
            if (prev) return prev; // Prevent multiple close calls
            // Wait for animation to complete before calling onClose
            setTimeout(() => {
                onClose();
            }, 350); // Match animation duration
            return true;
        });
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false); // Reset closing state when modal opens
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !isClosing) {
                handleClose();
            }
        };
        
        if (isOpen) {
            // Prevent background scrolling when modal is open
            document.body.style.overflow = 'hidden';
            
            // Push a state to history so back button works
            // This creates a history entry that we can pop when back is pressed
            window.history.pushState({ modal: true }, '');
            
            const handlePopState = () => {
                // When back button is pressed, just close the modal
                // Since this is a component modal (not route-based), no navigation happens
                // The popstate event means the history state was popped, so we close the modal
                if (!isClosing) {
                    handleClose();
                }
            };
            
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('popstate', handlePopState);
            
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('popstate', handlePopState);
            };
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isClosing, handleClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalRef.current && !isClosing) {
            handleClose();
        }
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div
            ref={modalRef}
            onClick={handleBackdropClick}
            className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
                backgroundColor: isClosing ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <div
                ref={contentRef}
                className="relative bg-white w-full rounded-t-2xl md:rounded-xl md:max-w-4xl md:mb-8 shadow-lifted mt-auto"
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

                <ProductDetailModal product={product} closeModal={handleClose} />
            </div>
        </div>
    );
}

