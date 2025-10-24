'use client';

import { useEffect, useState } from 'react';
import { getMarketHolidays } from '@/services/api';
import styles from './holidays.module.css';

interface Holiday {
    date: string;
    description: string;
    holiday_type: string;
    closed_exchanges: string[];
}

export default function Holidays() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await getMarketHolidays();
                setHolidays(response.data || []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHolidays();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Market Holidays</h1>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Closed Exchanges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holidays.map((holiday, index) => (
                            <tr key={index}>
                                <td>{holiday.date}</td>
                                <td>{holiday.description}</td>
                                <td>{holiday.holiday_type}</td>
                                <td>{holiday.closed_exchanges.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
