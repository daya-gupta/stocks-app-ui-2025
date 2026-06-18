'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Holding {
  id: string
  instrument_key: string
  instrument_name?: string
  quantity: number
  average_cost: number
  invested_value?: number
  current_price?: number
  current_value?: number
  pnl?: number
  pnl_percentage?: number
}

interface PortfolioHoldingsProps {
  portfolioIds: string[]
}

export default function PortfolioHoldings({ portfolioIds }: PortfolioHoldingsProps) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (portfolioIds.length > 0) {
      fetchHoldings()
    }
  }, [portfolioIds])

  // Helper function to fetch market data for an instrument
  const fetchMarketData = async (instrumentKey: string) => {
    try {
      // Call the backend holdings endpoint which should enrich with market data
      // If that fails, this would be where you'd call a market endpoint
      const response = await apiClient.get(`/market-price?instrument_key=${instrumentKey}`);
      return response?.data?.last_price || 0;
    } catch (error) {
      console.warn(`Could not fetch market data for ${instrumentKey}, using 0:`, error);
      return 0; // Fallback to 0 if market data unavailable
    }
  };

  // Helper function to extract or fetch instrument name
  const getInstrumentName = (instrumentKey: string) => {
    // Parse instrument_key format: NSE_EQ|INE01IU01018
    // Try to extract meaningful part or use as-is
    if (instrumentKey.includes('|')) {
      const parts = instrumentKey.split('|');
      return parts[parts.length - 1]; // Return the last part (usually the symbol)
    }
    return instrumentKey;
  };

  const enrichHoldingWithMarketData = async (holding: any): Promise<Holding> => {
    try {
      // Fetch current market price
      const currentPrice = await fetchMarketData(holding.instrument_key);
      
      // Calculate values
      const invested = holding.quantity * holding.average_cost;
      const current = holding.quantity * currentPrice;
      const pnl = current - invested;
      const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0;

      return {
        id: holding.id,
        instrument_key: holding.instrument_key,
        instrument_name: getInstrumentName(holding.instrument_key),
        quantity: holding.quantity,
        average_cost: holding.average_cost,
        invested_value: invested,
        current_price: currentPrice,
        current_value: current,
        pnl: pnl,
        pnl_percentage: pnlPercentage,
      };
    } catch (error) {
      console.error(`Error enriching holding ${holding.instrument_key}:`, error);
      // Return holding with safe defaults
      const invested = holding.quantity * holding.average_cost;
      return {
        id: holding.id,
        instrument_key: holding.instrument_key,
        instrument_name: getInstrumentName(holding.instrument_key),
        quantity: holding.quantity,
        average_cost: holding.average_cost,
        invested_value: invested,
        current_price: 0,
        current_value: 0,
        pnl: 0,
        pnl_percentage: 0,
      };
    }
  };

  const fetchHoldings = async () => {
    setLoading(true)
    try {
      const allHoldings: Holding[] = []
      
      for (const portfolioId of portfolioIds) {
        // Fetch holdings from API
        const holdingsData = await apiClient.get(`/portfolios/${portfolioId}/holdings`);
        
        // Enrich each holding with market data in parallel
        const enrichedHoldings = await Promise.all(
          holdingsData.map((holding: any) => enrichHoldingWithMarketData(holding))
        );
        
        allHoldings.push(...enrichedHoldings);
      }
      
      setHoldings(allHoldings)
    } catch (error) {
      console.error('Error fetching holdings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Loading holdings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No holdings found. Start by adding some transactions.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Holdings ({holdings.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchHoldings}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {holdings.map((holding) => (
          <Card key={holding.id}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Stock</h4>
                  <p className="font-semibold">{holding.instrument_name}</p>
                  <p className="text-xs text-gray-500">{holding.instrument_key}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600">Quantity & Avg Price</h4>
                  <p className="font-semibold">{holding.quantity.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">@ ₹{holding.average_cost.toFixed(2)}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600">Investment & Current</h4>
                  <p className="font-semibold">₹{(holding.invested_value || 0).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                  <p className="text-sm text-gray-500">
                    Current: ₹{(holding.current_value || 0).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className={`flex items-center ${
                    (holding.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(holding.pnl || 0) >= 0 ? 
                      <TrendingUp className="w-4 h-4 mr-1" /> : 
                      <TrendingDown className="w-4 h-4 mr-1" />
                    }
                    <span className="font-semibold">
                      ₹{Math.abs(holding.pnl || 0).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`mt-1 ${
                      (holding.pnl_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(holding.pnl_percentage || 0).toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
