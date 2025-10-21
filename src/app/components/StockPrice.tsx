'use client';

import { useEffect, useState } from 'react';
import styles from './StockPrice.module.css';

interface LTPData {
    last_price: number;
    cp: number;
}

interface StockPriceProps {
    instrumentKey: string;
}

export default function StockPrice({ instrumentKey }: StockPriceProps) {
    const [priceData, setPriceData] = useState<LTPData | null>(null);

    useEffect(() => {
        const fetchLTP = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/marketLTP?instrument_key=${instrumentKey}`
                );
                const data = await response.json();
                // setPriceData(data.data[instrumentKey]);
                setPriceData(data.data['NSE_INDEX:Nifty 50']);
            } catch (error) {
                console.error('Error fetching LTP:', error);
            }
        };

        fetchLTP();
        const interval = setInterval(fetchLTP, 60000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [instrumentKey]);

    if (!priceData) return null;

    const priceChange = priceData.last_price - priceData.cp;
    const changePercent = (priceChange / priceData.cp) * 100;
    const isPositive = priceChange >= 0;

    return (
        <div className={styles.priceContainer}>
            <span className={styles.price}>₹{priceData.last_price.toFixed(2)}</span>
            <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
        </div>
    );
}
