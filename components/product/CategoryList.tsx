'use client';

import { useSearchParams } from 'next/navigation';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';
import CategoryItem from './CategoryItem';

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

export default function CategoryList() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category') || 'All';

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
            {categories.map((cat) => (
                <CategoryItem
                    key={cat.name}
                    name={cat.name}
                    Icon={cat.icon}
                    isSelected={selectedCategory === cat.name}
                />
            ))}
        </div>
    );
}