'use client';

import { useEffect, useState } from 'react';
import styles from './MarketStatus.module.css';
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
                setStatus(data.data);
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
                Loading status please wait...
            </div>
        );
    }
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NORMAL_OPEN':
                return '#22c55e'; // green-500
            case 'NORMAL_CLOSE':
                return '#ef4444'; // red-500
            default:
                return '#f97316'; // orange-500
        }
    };

    const statusColor = getStatusColor(status.status);

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }}></span>
            <span className="text-sm font-medium">{status.status.replace('_', ' ')}</span>
            <StockPrice instrumentKey="NSE_INDEX|Nifty 50" />
        </div>
    );
}
