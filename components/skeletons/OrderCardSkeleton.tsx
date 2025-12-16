export default function OrderCardSkeleton() {
    return (
        <div className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="flex justify-between items-start">
                <div>
                    <div className="h-6 bg-lighter-gray rounded w-32 mb-2"></div>
                    <div className="h-4 bg-lighter-gray rounded w-48"></div>
                </div>
                <div className="h-6 bg-lighter-gray rounded-full w-24"></div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-3">
                <div className="h-5 bg-lighter-gray rounded w-20"></div>
                <div className="flex justify-between items-baseline">
                    <div className="h-5 bg-lighter-gray rounded w-16"></div>
                    <div className="h-7 bg-lighter-gray rounded w-28"></div>
                </div>
            </div>
        </div>
    );
}