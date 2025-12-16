// components/skeletons/AddressCardSkeleton.tsx
export default function AddressCardSkeleton() {
    return (
        <div className="glass-card p-5 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-lighter-gray rounded-md mt-1" />
                <div className="flex-grow space-y-2">
                    <div className="h-5 bg-lighter-gray rounded w-3/4" />
                    <div className="h-4 bg-lighter-gray rounded w-full" />
                    <div className="h-4 bg-lighter-gray rounded w-1/2" />
                    <div className="h-4 bg-lighter-gray rounded w-1/3 mt-2" />
                </div>
            </div>
            <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="h-4 bg-lighter-gray rounded w-16" />
                <div className="h-4 bg-lighter-gray rounded w-16" />
            </div>
        </div>
    );
}