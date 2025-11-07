'use client'

import { useState } from 'react'
import StockChart from '../components/StockChart'
import AutoCompletex from '../components/AutoCompletex'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
//   const [selectedStock, setSelectedStock] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<any>({ instrument_key: 'NSE_INDEX|Nifty 50', name: 'Nifty 50' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AutoCompletex onSelect={setSelectedStock} />
      </div>
      
      {selectedStock ? (
        <StockChart 
          instrumentKey={selectedStock.instrument_key || selectedStock.isin}
          instrumentName={selectedStock.name}
        />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Select a stock to view its chart</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Real-time market insights and analysis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Stocks with highest gains today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market News</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Latest market news and updates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
