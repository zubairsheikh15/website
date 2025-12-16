// components/skeletons/FormSkeleton.tsx
export default function FormSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4 animate-pulse">
            {/* Input field skeleton */}
            <div className="space-y-2">
                <div className="h-4 bg-lighter-gray rounded w-1/4" />
                <div className="h-10 bg-lighter-gray rounded-md w-full" />
            </div>
            {/* Two-column input skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="h-4 bg-lighter-gray rounded w-1/3" />
                    <div className="h-10 bg-lighter-gray rounded-md w-full" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-lighter-gray rounded w-1/3" />
                    <div className="h-10 bg-lighter-gray rounded-md w-full" />
                </div>
            </div>
            {/* Input field skeleton */}
            <div className="space-y-2">
                <div className="h-4 bg-lighter-gray rounded w-1/4" />
                <div className="h-10 bg-lighter-gray rounded-md w-full" />
            </div>
            {/* Checkbox skeleton */}
            <div className="flex items-center gap-2 pt-2">
                <div className="h-4 w-4 bg-lighter-gray rounded" />
                <div className="h-4 bg-lighter-gray rounded w-1/3" />
            </div>
            {/* Button skeleton */}
            <div className="pt-4">
                <div className="h-10 bg-lighter-gray rounded-lg w-1/3" />
            </div>
        </div>
    )
}