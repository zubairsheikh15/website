'use client';

import { Camera, Plus, MessageCircle } from 'lucide-react';

export default function UploadPrescriptionCard() {
    const handlePress = () => {
        // Opens the WhatsApp link in a new tab
        window.open('https://wa.me/919999050773', '_blank');
    };

    return (
        <button
            onClick={handlePress}
            className="group relative block w-full text-left rounded-2xl overflow-hidden bg-white shadow-md card-hover gpu-accelerated border border-gray-100/50"
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
            
            {/* Image container */}
            <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
                <Camera className="relative z-10 h-1/3 w-1/3 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            
            {/* Content section */}
            <div className="relative p-4 bg-white z-10">
                <h3 className="text-sm font-semibold truncate text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200">
                    Upload Prescription
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">Send via WhatsApp</span>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-full text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                        <Plus size={18} className="transition-transform duration-300" />
                    </div>
                </div>
            </div>
        </button>
    );
}