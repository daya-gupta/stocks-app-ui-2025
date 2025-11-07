'use client';

import Link from "next/link";
import Banner from "../components/Banner";
import MarketStatus from "../components/MarketStatus";
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
            {user && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10%', gap: '40px' }}>
                <div className="flex text-sm font-medium">
                    <Link className="ml-8" href="/alpha/watchlist">Watchlist</Link>
                    <Link className="ml-8" href="/alpha/portfolio">Portfolio</Link>
                    <Link className="ml-8" href="/alpha/insights">Insights</Link>
                </div>
            </div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 5%', gap: '16px' }}>
                <MarketStatus />
            </div>
            <div style={{ margin: '16px 5%', width: '90%' }}>
                {children}
            </div>
        </div>
    );
}
