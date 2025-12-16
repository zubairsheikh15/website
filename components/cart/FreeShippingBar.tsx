export default function FreeShippingBar({ subtotal, threshold }: { subtotal: number, threshold: number }) {
    if (!threshold || subtotal <= 0) return null;

    const remaining = threshold - subtotal;
    const progress = Math.min((subtotal / threshold) * 100, 100);

    if (remaining > 0) {
        return (
            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-4 text-center">
                <p>
                    Add <strong>₹{remaining.toFixed(2)}</strong> more to your cart to get FREE shipping!
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
                    <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 text-center">
            <p>🎉 You've unlocked FREE shipping!</p>
        </div>
    );
}