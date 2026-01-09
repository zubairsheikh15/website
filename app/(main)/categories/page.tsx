// app/(main)/categories/page.tsx
'use client';

import Link from 'next/link';
import { Pill, Droplet, Dumbbell, SprayCan, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    {
        id: 'medicine',
        name: 'Medicine',
        icon: Pill,
        color: 'bg-emerald-100 text-emerald-600',
        desc: 'Essential pharmaceuticals',
        gradient: 'from-emerald-500 to-teal-500'
    },
    {
        id: 'cosmetics',
        name: 'Cosmetics',
        icon: Droplet,
        color: 'bg-blue-100 text-blue-600',
        desc: 'Beauty & Skincare',
        gradient: 'from-blue-500 to-indigo-500'
    },
    {
        id: 'food',
        name: 'Food',
        icon: Dumbbell,
        color: 'bg-red-100 text-red-600',
        desc: 'Nutrition & Supplements',
        gradient: 'from-red-500 to-rose-500'
    },
    {
        id: 'perfumes',
        name: 'Perfumes',
        icon: SprayCan,
        color: 'bg-amber-100 text-amber-600',
        desc: 'Luxury Fragrances',
        gradient: 'from-amber-500 to-orange-500'
    },
];

export default function CategoriesPage() {
    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-3xl font-heading font-bold mb-2">Explore Categories</h1>
                <p className="text-muted-foreground">Find exactly what you need</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat, index) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/?category=${cat.id}`} className="group relative block h-40 overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all">
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 transition-opacity group-hover:opacity-100`} />
                            {/* Decorative bubbles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:blur-3xl transition-all" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                            <div className="relative h-full flex items-center justify-between p-8 text-white z-10">
                                <div>
                                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md mb-4 shadow-inner border border-white/20">
                                        <cat.icon size={24} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{cat.name}</h2>
                                    <p className="text-white/80 text-sm font-medium mt-1">{cat.desc}</p>
                                </div>

                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                                    <ArrowRight size={24} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-6 glass-panel rounded-2xl text-center border border-primary/20 bg-primary/5"
            >
                <Sparkles className="mx-auto w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-lg text-foreground">Premium Selection</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Discover our curated collection of high-end products.</p>
                <Link href="/" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold shadow-soft hover:shadow-glow transition-all text-sm">
                    View All Products
                </Link>
            </motion.div>
        </div>
    );
}
