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
            <div style={{ margin: '16px 5%', width: '90%' }}>
                {children}
            </div>
        </div>
    );
}
