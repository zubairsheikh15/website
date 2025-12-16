export default function ProductCardSkeleton() {
    return (
        <div className="border rounded-lg overflow-hidden bg-white/50 animate-pulse">
            <div className="w-full aspect-square bg-lighter-gray" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-lighter-gray rounded w-3/4"></div>
                <div className="h-5 bg-lighter-gray rounded w-1/2"></div>
            </div>
        </div>
    );
}