"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import BackButton from "@/components/ui/BackButton";
import { logger } from "@/lib/logger";

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();
    const [fullName, setFullName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);

    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            setFetching(true);
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", session.user.id)
                    .single();

                if (error) {
                    logger.error("Error fetching profile", error);
                    toast.error("Failed to fetch profile");
                } else if (data) {
                    setFullName(data.full_name);
                }
            } catch (err) {
                logger.error("Unexpected error", err);
                toast.error("Something went wrong");
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [session, router, supabase]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        setLoading(true);
        const toastId = toast.loading("Updating profile...");
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: fullName })
                .eq("id", session.user.id);

            if (error) {
                toast.error(error.message, { id: toastId });
            } else {
                toast.success("Profile updated successfully!", { id: toastId });
            }
        } catch (err) {
            logger.error("Unexpected error", err);
            toast.error("Failed to update profile", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    if (fetching) {
        return (
            <div className="max-w-2xl mx-auto py-10 text-center">
                <BackButton />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            <form
                onSubmit={handleUpdateProfile}
                className="p-6 bg-white rounded-lg shadow-md space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <p className="text-gray-500 mt-1">{session.user.email}</p>
                </div>
                <div>
                    <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                        required
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </div>
    );
}
