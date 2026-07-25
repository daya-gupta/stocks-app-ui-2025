'use client';

import Banner from "../components/Banner";
import { useAuth } from "../components/AuthProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <div>
            <Banner />
            <div>
                {children}
            </div>
        </div>
    );
}
