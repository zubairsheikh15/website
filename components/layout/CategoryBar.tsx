"use client";

import Link from 'next/link';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';

const categories = [
    { name: 'All', href: '/?category=All', Icon: LayoutGrid },
    { name: 'medicine', href: '/?category=medicine', Icon: Pill },
    { name: 'cosmetics', href: '/?category=cosmetics', Icon: Droplet },
    { name: 'food', href: '/?category=food', Icon: Dumbbell },
    { name: 'perfumes', href: '/?category=perfumes', Icon: SprayCan },
];

export default function CategoryBar() {
    return (
        <div className="w-full bg-white/70 backdrop-blur border-t border-b">
            <div className="container max-w-screen-2xl mx-auto px-4 md:px-6 overflow-x-auto hide-scrollbar">
                <nav className="flex items-center gap-4 md:gap-6 h-12">
                    {categories.map(({ name, href, Icon }) => (
                        <Link
                            key={name}
                            href={href}
                            className="flex items-center gap-2 text-sm text-dark-gray hover:text-primary whitespace-nowrap transition-colors duration-200 ease-out"
                        >
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}


