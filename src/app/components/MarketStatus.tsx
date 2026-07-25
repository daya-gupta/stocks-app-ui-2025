'use client';

import { useEffect, useState } from 'react';
import StockPrice from './StockPrice';

interface MarketStatusData {
    exchange: string;
    status: string;
    last_updated: number;
}

export default function MarketStatus() {
    const [status, setStatus] = useState<MarketStatusData | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketStatus`);
                const data = await response.json();
                let customStatus = data.data.status;
                customStatus = customStatus.indexOf('OPEN') !== -1 ? 'OPEN' : 'CLOSED';
                setStatus({ ...data.data, status: customStatus });
            } catch (error) {
                console.error('Error fetching market status:', error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    if (!status) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                Loading Market Status...
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return '#22c55e'; // green-500
            case 'CLOSED':
                return '#ef4444'; // red-500
            default:
                return '#f97316'; // orange-500
        }
    };

    const statusColor = getStatusColor(status.status);

    return (
        <div className="px-4 py-4">
            <StockPrice instrumentKey="NSE_INDEX|Nifty 50" />
            <div className="text-center">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }}></span>
                <span className="text-sm font-medium inline-block" style={{ color: statusColor }}>MARKET {status.status.replace('_', ' ')}</span>
            </div>
        </div>
    );
}
