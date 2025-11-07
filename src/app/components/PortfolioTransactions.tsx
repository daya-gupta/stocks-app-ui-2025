'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: string
  instrument_key: string
  transaction_type: string
  quantity: number
  price: number
  total_amount: number
  brokerage: number
  taxes: number
  transaction_date: string
  notes?: string
  created_at: string
}

interface PortfolioTransactionsProps {
  portfolioIds: string[]
}

export default function PortfolioTransactions({ portfolioIds }: PortfolioTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (portfolioIds.length > 0) {
      fetchTransactions()
    }
  }, [portfolioIds])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const allTransactions: Transaction[] = []
      for (const portfolioId of portfolioIds) {
        const data = await apiClient.get(`/portfolios/${portfolioId}/transactions`)
        allTransactions.push(...data)
      }
      // Sort by date desc
      allTransactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      setTransactions(allTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
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
            <p>Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No transactions found. Add your first transaction to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transactions ({transactions.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchTransactions}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  {transaction.transaction_type === 'BUY' ? 
                    <ArrowUpCircle className="w-5 h-5 text-green-600" /> :
                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  }
                  <div>
                    <p className="font-medium">{transaction.instrument_key}</p>
                    <Badge variant={transaction.transaction_type === 'BUY' ? 'default' : 'secondary'}>
                      {transaction.transaction_type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{transaction.quantity.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium">₹{transaction.price.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">₹{transaction.total_amount.toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                  {transaction.notes && (
                    <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
