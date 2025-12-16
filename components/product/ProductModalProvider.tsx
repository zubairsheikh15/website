'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';
import ProductModal from './ProductModal';

interface ProductModalContextType {
    openModal: (product: Product) => void;
    closeModal: () => void;
    isOpen: boolean;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export function ProductModalProvider({ children }: { children: ReactNode }) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (product: Product) => {
        setSelectedProduct(product);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // Small delay to allow animation to finish
        setTimeout(() => setSelectedProduct(null), 300);
    };

    return (
        <ProductModalContext.Provider value={{ openModal, closeModal, isOpen }}>
            {children}
            {selectedProduct && (
                <ProductModal product={selectedProduct} isOpen={isOpen} onClose={closeModal} />
            )}
        </ProductModalContext.Provider>
    );
}

export function useProductModal() {
    const context = useContext(ProductModalContext);
    if (context === undefined) {
        throw new Error('useProductModal must be used within a ProductModalProvider');
    }
    return context;
}

