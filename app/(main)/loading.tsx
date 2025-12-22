// app/(main)/loading.tsx

export default function Loading() {
    return (
        // This div will grow to fill the available space in the main tag
        <div className="flex flex-grow flex-col items-center justify-center py-24 min-h-[60vh]">
            <div className="relative h-24 w-24">
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 opacity-75 blur-md"></div>

                {/* The spinning logo */}
                <div className="relative animate-spin-slow">
                    <img
                        src="/logo.png"
                        alt="Loading..."
                        width={96}
                        height={96}
                        className="rounded-full object-contain" // Added to make it look cleaner as it spins
                    />
                </div>
            </div>
            <p className="mt-6 text-lg font-semibold text-dark-gray animate-pulse">
                Loading...
            </p>
        </div>
    );
}