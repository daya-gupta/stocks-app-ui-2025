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
  instrument_name: string
  total_quantity: number
  average_price: number
  invested_value: number
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

  const fetchHoldings = async () => {
    setLoading(true)
    try {
      const allHoldings: Holding[] = []
      for (const portfolioId of portfolioIds) {
        const data = await apiClient.get(`/portfolios/${portfolioId}/holdings`)
        allHoldings.push(...data)
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
                  <p className="font-semibold">{holding.total_quantity.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">@ ₹{holding.average_price.toFixed(2)}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600">Investment</h4>
                  <p className="font-semibold">₹{holding.invested_value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Current: ₹{(holding.current_value || 0).toLocaleString()}
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
                      ₹{Math.abs(holding.pnl || 0).toLocaleString()}
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
