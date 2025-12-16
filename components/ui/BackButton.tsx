'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors mb-6 font-medium"
        >
            <ChevronLeft size={20} />
            Back
        </button>
    );
}