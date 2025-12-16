// components/profile/AddressForm.tsx
'use client';

import { Address } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Button from "../ui/Button";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Phone, MapPin, Home, Hash, Globe, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface AddressFormProps {
    address?: Address; // Make address optional for new addresses
    onSave?: () => void; // Callback after successful save
    onCancel?: () => void; // Optional: Add a cancel handler (e.g., for modals)
}

export default function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // This state now correctly matches the 'addresses' table schema
    const [formData, setFormData] = useState({
        street_address: address?.street_address || '',
        city: address?.city || '',
        state: address?.state || '',
        postal_code: address?.postal_code || '',
        country: address?.country || 'India',
        house_no: address?.house_no || '',
        mobile_number: '', // Initialize mobile number, will be set in useEffect
        landmark: address?.landmark || '',
        is_default: address?.is_default || false,
    });

    // Effect to set initial mobile_number
    useEffect(() => {
        // Pre-fill from editing address if available
        if (address) {
            setFormData(prev => ({
                ...prev,
                mobile_number: address.mobile_number || '',
                // Ensure other fields from address prop are also loaded
                street_address: address.street_address || '',
                city: address.city || '',
                state: address.state || '',
                postal_code: address.postal_code || '',
                country: address.country || 'India',
                house_no: address.house_no || '',
                landmark: address.landmark || '',
                is_default: address.is_default || false,
            }));
        } else if (session?.user) {
            // Otherwise, pre-fill from user's profile metadata when creating a new address
            setFormData(prev => ({
                ...prev,
                // Only prefill if the field is currently empty
                mobile_number: prev.mobile_number || session.user.user_metadata?.phone_number || '',
            }));
        }
    }, [address, session]);


    const inputStyles =
        "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm mt-1";
    const inputStylesWithIcon =
        "block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm mt-1";
    const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none";


    // Handle input changes
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = event.target;

        // Special handling for numeric inputs
        if (name === 'mobile_number') {
            const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue.slice(0, 10), // Limit to 10 digits
            }));
        } else if (name === 'postal_code') {
            const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue.slice(0, 6), // Limit to 6 digits
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    }

    // Handle form submission
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!session?.user) {
            router.push('/login'); // Redirect to login if not authenticated
            return;
        }

        // --- Validation ---
        const phoneRegex = /^[6-9]\d{9}$/; // Starts with 6-9, 10 digits total
        if (!formData.mobile_number || !phoneRegex.test(formData.mobile_number)) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return;
        }
        const postalCodeRegex = /^\d{6}$/;
        if (!formData.postal_code || !postalCodeRegex.test(formData.postal_code)) {
            toast.error('Please enter a valid 6-digit postal code.');
            return;
        }
        // ------------------

        setLoading(true);
        const toastId = toast.loading(address ? 'Updating address...' : 'Saving address...');

        try {
            // If this address is being set as default, unset others first
            if (formData.is_default) {
                const { error: unsetError } = await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('user_id', session.user.id)
                    .eq('is_default', true)
                    .neq('id', address?.id || '00000000-0000-0000-0000-000000000000');

                if (unsetError) {
                    logger.error("Error unsetting default address", unsetError);
                }
            }

            // Create the data object for upsert, matching the table schema
            const upsertData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string, user_id: string } = {
                user_id: session.user.id,
                street_address: formData.street_address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                country: formData.country,
                // --- THIS IS THE FIX ---
                house_no: formData.house_no || undefined,
                mobile_number: formData.mobile_number,
                landmark: formData.landmark || undefined,
                // -----------------------
                is_default: formData.is_default,
            };

            // Add 'id' only if we are editing (address prop exists)
            if (address?.id) {
                upsertData.id = address.id;
            }

            const { error } = await supabase
                .from("addresses")
                .upsert(upsertData); //

            if (error) throw error;

            toast.success("Address saved successfully!", { id: toastId });

            if (onSave) {
                onSave(); // Call callback (e.g., in checkout modal)
            } else {
                // Determine current path to decide whether to push or just refresh
                const currentPath = window.location.pathname;
                if (currentPath.includes('/addresses/new') || currentPath.includes('/addresses/')) { // Updated to catch edit path
                    router.push("/addresses"); // Navigate away from dedicated add/edit pages
                } else {
                    router.refresh(); // Refresh data on the current page (e.g., /checkout)
                }
            }
        } catch (error: any) {
            logger.error("Error saving address", error);
            toast.error(error.message || "Error saving address. Please try again.", { id: toastId });
        } finally {
            setLoading(false);
        }
    }

    return (
        // Use glass-card for consistency
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">

            {/* Contact Details */}
            <div>
                <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="relative mt-1">
                    <Phone className={iconClasses} />
                    <input
                        id="mobile_number"
                        name="mobile_number"
                        type="tel"
                        value={formData.mobile_number}
                        onChange={handleChange}
                        className={inputStylesWithIcon}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                    />
                </div>
            </div>

            {/* Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="house_no" className="block text-sm font-medium text-gray-700">House No / Flat No</label>
                    <div className="relative mt-1">
                        <Home className={iconClasses} />
                        <input
                            id="house_no"
                            name="house_no"
                            type="text"
                            value={formData.house_no}
                            onChange={handleChange}
                            className={inputStylesWithIcon}
                            placeholder="e.g. A-101, Floor 3"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="street_address" className="block text-sm font-medium text-gray-700">Street Address / Area</label>
                    <div className="relative mt-1">
                        <MapPin className={iconClasses} />
                        <input
                            id="street_address"
                            name="street_address"
                            type="text"
                            value={formData.street_address}
                            onChange={handleChange}
                            className={inputStylesWithIcon}
                            placeholder="Enter street address"
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">Landmark (Optional)</label>
                <div className="relative mt-1">
                    <Building className={iconClasses} />
                    <input
                        id="landmark"
                        name="landmark"
                        type="text"
                        value={formData.landmark}
                        onChange={handleChange}
                        className={inputStylesWithIcon}
                        placeholder="e.g. Near City Mall"
                    />
                </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <div className="relative mt-1">
                        <Hash className={iconClasses} />
                        <input
                            id="postal_code"
                            name="postal_code"
                            type="tel" // Use tel for numeric keyboard on mobile
                            value={formData.postal_code}
                            onChange={handleChange}
                            className={inputStylesWithIcon}
                            placeholder="6-digit PIN code"
                            maxLength={6}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputStyles}
                        placeholder="Enter city"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        className={inputStyles}
                        placeholder="Enter state"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <div className="relative mt-1">
                        <Globe className={iconClasses} />
                        <input
                            id="country"
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleChange}
                            className={inputStylesWithIcon}
                            placeholder="e.g. India"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Set as Default */}
            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Set as default address
                </label>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? "Saving..." : "Save Address"}
                </Button>
                {/* Conditionally render Cancel button if handler is provided */}
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading} fullWidth>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}