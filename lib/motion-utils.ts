// lib/motion-utils.ts
// Lightweight motion utilities for low-end devices

export const isLowEndDevice = () => {
    if (typeof window === 'undefined') return false;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return true;

    // Check device memory (if available)
    if ('deviceMemory' in navigator) {
        const memory = (navigator as any).deviceMemory;
        if (memory && memory < 4) return true; // Less than 4GB RAM
    }

    // Check hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return true; // Less than 4 CPU cores
    }

    return false;
};

// Simplified animation variants for low-end devices
export const getOptimizedVariants = () => {
    const isLowEnd = isLowEndDevice();

    return {
        fadeIn: isLowEnd
            ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
            : {
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { duration: 0.2 } }
            },

        slideUp: isLowEnd
            ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
            : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            },

        scale: isLowEnd
            ? { whileHover: {}, whileTap: {} }
            : {
                whileHover: { scale: 1.05, transition: { duration: 0.2 } },
                whileTap: { scale: 0.95 }
            }
    };
};

// Conditional motion component
export const shouldUseMotion = () => {
    return !isLowEndDevice();
};

// Use this in components like:
// const useMotion = shouldUseMotion();
// return useMotion ? <motion.div {...props} /> : <div {...props} />;