'use client'
import Image from 'next/image';

// Since the schema has a single image_url, we will display that.
// This component can be expanded if you add multiple images later.
export default function ProductImageSlider({ imageUrl, alt }: { imageUrl: string, alt: string }) {
    return (
        <div className="relative w-full aspect-square overflow-hidden">
            <Image
                src={imageUrl}
                alt={alt}
                fill={true}
                style={{ objectFit: 'cover' }}
                priority
                className="object-cover"
            />
        </div>
    );
}