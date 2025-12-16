'use client';

import { Camera, Plus } from 'lucide-react';

export default function UploadPrescriptionCard() {
    const handlePress = () => {
        // Opens the WhatsApp link in a new tab
        window.open('https://wa.me/919999050773', '_blank');
    };

    return (
        <button
            onClick={handlePress}
            className="group block w-full text-left rounded-xl overflow-hidden bg-white shadow-subtle transition-all duration-200 ease-out hover:shadow-medium"
            style={{ willChange: 'box-shadow' }}
        >
            <div className="relative w-full aspect-square overflow-hidden bg-theme-green flex items-center justify-center">
                <Camera className="h-1/3 w-1/3 text-theme-green-fg transition-opacity duration-200 ease-out group-hover:opacity-90" />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-dark-gray">Upload Prescription</h3>
                <div className="flex items-center justify-between mt-1">
                    <div>
                        <span className="text-base font-bold text-theme-green-fg">Send via WhatsApp</span>
                    </div>
                    <div className="bg-lighter-gray p-1.5 rounded-full text-dark-gray transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-hover:bg-primary md:group-hover:text-white">
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </button>
    );
}