'use client'

import { useEffect, useState } from "react";
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, RefreshCw } from 'lucide-react'
import PortfolioHoldings from '@/app/components/PortfolioHoldings'

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
    const [portfolioSummary, setPortfolioSummary] = useState({
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        holdingCount: 0
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
            let holdingCount = 0

            for (const portfolioId of selectedPortfolios) {
                const holdings = await apiClient.get(`/portfolios/${portfolioId}/holdings`)
                holdingCount += holdings.length

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
                totalPnLPercentage,
                holdingCount
            })
        } catch (error) {
            console.error('Error calculating portfolio summary:', error)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                {/* <Button className="pull-right" variant="outline" size="sm" onClick={fetchPortfolios}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                </Button> */}

                <h1 className="text-xl font-bold">
                    <span>Portfolio Performance</span>
                    &nbsp;
                    <span className="text-lg text-gray-600">({portfolioSummary.holdingCount} stocks)</span>
                    {/* <span className="text-lg text-gray-600">Track your investments and performance</span> */}
                </h1>
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

            <PortfolioHoldings portfolioIds={selectedPortfolios} />
        </div>
    );
}

export default Portfolio;
