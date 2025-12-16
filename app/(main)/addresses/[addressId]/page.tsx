'use client';

import AddressForm from "@/components/profile/AddressForm";
import BackButton from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase-client";
import { Address } from "@/lib/types";
import { useEffect, useState } from "react";
import FormSkeleton from "@/components/skeletons/FormSkeleton"; // Import skeleton

export default function EditAddressPage({ params }: { params: { addressId: string } }) {
    const supabase = createClient();
    const [address, setAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddress = async () => {
            // Check for valid addressId
            if (!params.addressId) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('addresses')
                .select('*')
                .eq('id', params.addressId)
                .single();

            if (data) setAddress(data);
            setLoading(false);
        };
        fetchAddress();
    }, [params.addressId, supabase]);

    return (
        // Use max-w-2xl for form width, remove vertical padding
        <div className="max-w-2xl mx-auto px-4">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">Edit Address</h1>
            {loading ? (
                <FormSkeleton /> // Use skeleton instead of text
            ) : address ? (
                <AddressForm address={address} />
            ) : (
                <p>Address not found.</p>
            )}
        </div>
    );
}