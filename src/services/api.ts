const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const getMarketHolidays = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketHolidays`);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    } catch (error) {
        console.error('Error fetching market holidays:', error);
        throw error;
    }
};
