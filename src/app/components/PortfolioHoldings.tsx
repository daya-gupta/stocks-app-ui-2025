'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Sort from '../sort'

interface Holding {
  id: string
  instrument_key: string
  trading_symbol?: string
  company_name?: string
  quantity: number
  average_cost: number
  current_price?: number
  invested_value?: number
  current_value?: number
  pnl?: number
  pnl_percentage?: number
}

interface PortfolioHoldingsProps {
  portfolioIds: string[]
}

type SortKey = 'trading_symbol' | 'current_price' | 'quantity' | 'average_cost' | 'invested_value' | 'current_value' | 'pnl' | 'pnl_percentage'

interface SortState {
  key: SortKey | null
  order: 1 | -1
}

export default function PortfolioHoldings({ portfolioIds }: PortfolioHoldingsProps) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<SortState>({ key: null, order: 1 })

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
        // Fetch holdings - backend now returns enriched data with current prices and P&L
        const holdingsData = await apiClient.get(`/portfolios/${portfolioId}/holdings`);
        allHoldings.push(...holdingsData);
      }
      
      setHoldings(allHoldings)
    } catch (error) {
      console.error('Error fetching holdings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: SortKey) => {
    let newOrder: 1 | -1 = 1
    if (sort.key === key && sort.order === 1) {
      newOrder = -1
    }
    setSort({ key, order: newOrder })

    const sortedHoldings = [...holdings].sort((a, b) => {
      let aVal: any = a[key]
      let bVal: any = b[key]

      if (key === 'trading_symbol') {
        return newOrder === 1 
          ? (aVal || '').localeCompare(bVal || '')
          : (bVal || '').localeCompare(aVal || '')
      }

      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0

      return newOrder === 1 ? aVal - bVal : bVal - aVal
    })

    setHoldings(sortedHoldings)
  }

  const calculateTotals = () => {
    return {
      quantity: holdings.reduce((sum, h) => sum + (h.quantity || 0), 0),
      invested_value: holdings.reduce((sum, h) => sum + (h.invested_value || 0), 0),
      current_value: holdings.reduce((sum, h) => sum + (h.current_value || 0), 0),
      pnl: holdings.reduce((sum, h) => sum + (h.pnl || 0), 0),
      pnl_percentage: holdings.length > 0 
        ? (holdings.reduce((sum, h) => sum + (h.pnl || 0), 0) / holdings.reduce((sum, h) => sum + (h.invested_value || 0), 0)) * 100
        : 0
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

  const totals = calculateTotals()
  const totalPnlColor = totals.pnl >= 0 ? 'text-green-600' : 'text-red-600'

  const columnHeaders = [
    { key: 'trading_symbol', label: 'Stock', sortable: true },
    { key: 'current_price', label: 'Price', sortable: true, align: 'right' },
    { key: 'quantity', label: 'Quantity', sortable: true, align: 'right' },
    { key: 'average_cost', label: 'Avg Price', sortable: true, align: 'right' },
    { key: 'invested_value', label: 'Invested', sortable: true, align: 'right' },
    { key: 'current_value', label: 'Current Value', sortable: true, align: 'right' },
    { key: 'pnl', label: 'P&L', sortable: true, align: 'right' },
    { key: 'pnl_percentage', label: 'Return %', sortable: true, align: 'right' },
  ]

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              {columnHeaders.map((header) => (
                <th 
                  key={header.key} 
                  className={`px-4 py-3 text-left font-semibold text-sm ${header.align === 'right' ? 'text-right' : ''}`}
                >
                  <div className="flex items-center justify-between cursor-pointer group">
                    <span>{header.label}</span>
                    {header.sortable && (
                      <span onClick={() => handleSort(header.key as SortKey)} className="ml-2">
                        <Sort 
                          sortOrder={sort.key === header.key ? sort.order : 0} 
                          handleSortChange={(order) => handleSort(header.key as SortKey)} 
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => (
              <tr key={holding.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm">{holding.trading_symbol || holding.instrument_key}</p>
                    <p className="text-xs text-gray-500">{holding.company_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm">₹{(holding.current_price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm">{holding.quantity.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right text-sm">₹{holding.average_cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium">₹{(holding.invested_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right text-sm font-medium">₹{(holding.current_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td className={`px-4 py-3 text-right text-sm font-semibold ${(holding.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {(holding.pnl || 0) >= 0 ? 
                      <TrendingUp className="w-4 h-4" /> : 
                      <TrendingDown className="w-4 h-4" />
                    }
                    ₹{Math.abs(holding.pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </td>
                <td className={`px-4 py-3 text-right text-sm font-semibold ${(holding.pnl_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(holding.pnl_percentage || 0).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200 border-t-2 border-gray-300 font-bold">
            <tr>
              <td className="px-4 py-3 text-sm">Total</td>
              <td className="px-4 py-3 text-right text-sm">-</td>
              <td className="px-4 py-3 text-right text-sm">{totals.quantity.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-3 text-right text-sm">-</td>
              <td className="px-4 py-3 text-right text-sm">₹{totals.invested_value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-3 text-right text-sm">₹{totals.current_value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td className={`px-4 py-3 text-right text-sm ${totalPnlColor}`}>
                <div className="flex items-center justify-end gap-1">
                  {totals.pnl >= 0 ? 
                    <TrendingUp className="w-4 h-4" /> : 
                    <TrendingDown className="w-4 h-4" />
                  }
                  ₹{Math.abs(totals.pnl).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </td>
              <td className={`px-4 py-3 text-right text-sm ${totalPnlColor}`}>
                {totals.pnl_percentage.toFixed(2)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
