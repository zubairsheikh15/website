'use client';

import { Address } from "@/lib/types";
import { MapPin, Trash2, Edit, Home, Phone, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AddressCard({ address }: { address: Address }) {
    const supabase = createClient();
    const router = useRouter();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this address?')) {
            const toastId = toast.loading('Deleting address...');
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', address.id);

            toast.dismiss(toastId);
            if (error) {
                toast.error(error.message);
            } else {
                toast.success('Address deleted successfully!');
                router.refresh(); // Refresh the page to show the updated list
            }
        }
    };

    return (
        <motion.div
            // --- THIS IS THE FIX ---
            // Changed `shadow` to `boxShadow` and used the exact CSS value
            whileHover={{
                y: -4,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.07)'
            }}
            // -----------------------
            className="glass-card p-5 relative overflow-hidden" // Use glass-card
        >
            {address.is_default && (
                <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={14} />
                    Default
                </div>
            )}
            <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1 flex-shrink-0" size={24} />
                <div>
                    <p className="font-bold text-dark-gray">{address.street_address}</p>
                    <p className="text-sm text-gray-600">
                        {address.house_no && `${address.house_no}, `}
                        {address.landmark && `${address.landmark}, `}
                        {address.city}, {address.state} - {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                    {address.mobile_number && (
                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                            <Phone size={14} /> {address.mobile_number}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                    // This link should be correct now based on your file structure
                    onClick={() => router.push(`/addresses/${address.id}`)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                    <Edit size={14} /> Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={14} /> Delete
                </button>
            </div>
        </motion.div>
    );
}