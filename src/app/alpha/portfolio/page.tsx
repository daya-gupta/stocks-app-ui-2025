'use client'

import { useEffect, useState } from "react";
import { apiClient } from '@/lib/api'

import CurrentPortfolio from "./components/portfolio";

const Portfolio = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');

  const fetchWatchlists = async () => {
    try {
      const data = await apiClient.get('/watchlists')
      setWatchlists(data);
      if (data.length > 0) {
        setSelectedWatchlist(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  return (
    <div>
      <h1>Alpha Portfolio Page</h1>
      <div>
        <p>Selected Watchlist: {selectedWatchlist}</p>
      </div>
      <div>
        <p>Watchlists: {watchlists.map(w => w.id).join(', ')}</p>
      </div>

      {selectedWatchlist && <CurrentPortfolio watchlistId={selectedWatchlist} />}
    </div>

  );
}

export default Portfolio;

