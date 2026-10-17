'use client'

import { useState, useEffect } from 'react'
import WatchlistEntries from '@/app/components/WatchlistEntries'

interface Watchlist {
  id: string
  name: string
  description?: string
  tags: string[]
  created_at: string
}

// const publicWatchlistId = 'd6db4fd1-3b3c-4c9e-b64b-b3b360210a1f'; // stocks
const publicWatchlistId = 'e7151eff-be7f-4db5-a253-33be77eebba4'; // test_connectivity


export default function WatchlistPage() {
  const [selectedWatchlists, setSelectedWatchlist] = useState<string[]>([publicWatchlistId])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quality stocks that meet our criteria.</h2>
      </div>

      <div className="pt-4">
        <WatchlistEntries watchlistIds={selectedWatchlists} />
      </div>
    </div>
  )
}
