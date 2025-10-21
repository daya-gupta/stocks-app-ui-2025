'use client';

import { useEffect, useState } from 'react';
import styles from './MarketStatus.module.css';

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

    if (!status) return null;

    const statusColor = status.status === 'NORMAL_OPEN' ? '#4CAF50' : '#FF9800';

    return (
        <div className={styles.statusContainer}>
            <span className={styles.statusDot} style={{ backgroundColor: statusColor }}></span>
            <span>Market {status.status.replace('_', ' ')}</span>
        </div>
    );
}
