'use client'

import { useState } from 'react'
import StockChart from '../components/StockChart'
import AutoCompletex from '../components/AutoCompletex'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState<any>({ instrument_key: 'NSE_INDEX|Nifty 50', trading_symbol: 'NIFTY50' });

  return (
    <div className="space-y-6 p-4">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Stock Analysis</h1>
        <AutoCompletex onSelect={setSelectedStock} />
      </div>
      
      {/* Chart Section */}
      {selectedStock && (
        <StockChart 
          key={selectedStock.instrument_key}
          instrumentKey={selectedStock.instrument_key || selectedStock.isin}
          instrumentName={selectedStock.trading_symbol || selectedStock.name}
        />
      )}

      {/* Market Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Market Overview</h3>
            <p className="text-gray-500 text-sm">Real-time market insights and analysis</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Gainers</h3>
            <p className="text-gray-500 text-sm">Stocks with highest gains today</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Market News</h3>
            <p className="text-gray-500 text-sm">Latest market news and updates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
