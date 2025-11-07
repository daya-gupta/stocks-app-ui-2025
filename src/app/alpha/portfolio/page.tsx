'use client'

import { useEffect, useState } from "react";
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import PortfolioForm from '@/app/components/PortfolioForm'
import TransactionForm from '@/app/components/TransactionForm'
import PortfolioHoldings from '@/app/components/PortfolioHoldings'
import PortfolioTransactions from '@/app/components/PortfolioTransactions'

interface Portfolio {
  id: string
  name: string
  description?: string
  currency: string
  created_at: string
}

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercentage: 0
  })

  useEffect(() => {
    fetchPortfolios()
  }, [])

  useEffect(() => {
    if (selectedPortfolios.length > 0) {
      calculatePortfolioSummary()
    }
  }, [selectedPortfolios])

  const fetchPortfolios = async () => {
    try {
      const data = await apiClient.get('/portfolios')
      setPortfolios(data)
      if (data.length > 0) {
        setSelectedPortfolios([data[0].id])
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error)
    }
  }

  const calculatePortfolioSummary = async () => {
    try {
      let totalValue = 0
      let totalInvested = 0
      
      for (const portfolioId of selectedPortfolios) {
        const holdings = await apiClient.get(`/portfolios/${portfolioId}/holdings`)
        
        holdings.forEach((holding: any) => {
          totalValue += holding.current_value || 0
          totalInvested += holding.invested_value || 0
        })
      }
      
      const totalPnL = totalValue - totalInvested
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
      
      setPortfolioSummary({
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercentage
      })
    } catch (error) {
      console.error('Error calculating portfolio summary:', error)
    }
  }

  const handleCreatePortfolio = async (data: any) => {
    try {
      await apiClient.post('/portfolios', data)
      fetchPortfolios()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating portfolio:', error)
    }
  }

  const togglePortfolioSelection = (id: string) => {
    setSelectedPortfolios(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-gray-600">Track your investments and performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTransactionForm(true)} disabled={selectedPortfolios.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{portfolioSummary.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invested Amount</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{portfolioSummary.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {portfolioSummary.totalPnL >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> :
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{portfolioSummary.totalPnL.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Returns %</CardTitle>
            {portfolioSummary.totalPnLPercentage >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> :
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioSummary.totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioSummary.totalPnLPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Portfolios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolios.map(portfolio => (
                <div
                  key={portfolio.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPortfolios.includes(portfolio.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => togglePortfolioSelection(portfolio.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{portfolio.name}</h3>
                      {portfolio.description && (
                        <p className="text-sm text-gray-600">{portfolio.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{portfolio.currency}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedPortfolios.length > 0 ? (
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings" className="space-y-4">
                <PortfolioHoldings portfolioIds={selectedPortfolios} />
              </TabsContent>
              
              <TabsContent value="transactions" className="space-y-4">
                <PortfolioTransactions portfolioIds={selectedPortfolios} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-gray-500">Select a portfolio to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Forms */}
      {showCreateForm && (
        <PortfolioForm
          onSubmit={handleCreatePortfolio}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showTransactionForm && (
        <TransactionForm
          portfolioIds={selectedPortfolios}
          onSubmit={async () => {
            setShowTransactionForm(false)
            calculatePortfolioSummary()
          }}
          onCancel={() => setShowTransactionForm(false)}
        />
      )}
    </div>
  );
}

export default Portfolio;

