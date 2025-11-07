'use client'

import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StockChartProps {
  instrumentKey: string
  instrumentName?: string
}

const intervals = [
  { value: '1minute', label: '1m' },
  { value: '5minute', label: '5m' },
  { value: '15minute', label: '15m' },
  { value: '30minute', label: '30m' },
  { value: 'day', label: '1D' }
]

const chartTypes = [
  { value: 'candlestick', label: 'Candlestick' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' }
]

export default function StockChart({ instrumentKey, instrumentName }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candlestickSeriesRef = useRef<any>(null)
  const lineSeriesRef = useRef<any>(null)
  const areaSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)

  const [interval, setInterval] = useState('day')
  const [chartType, setChartType] = useState('candlestick')
  const [loading, setLoading] = useState(false)
  const [showVolume, setShowVolume] = useState(true)

  useEffect(() => {
    const initChart = async () => {
      if (chartContainerRef.current) {
        try {
          // Dynamic import to avoid SSR issues
          const { createChart } = await import('lightweight-charts')
          
          // Create chart
          chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 500,
            layout: {
              background: { color: '#ffffff' },
              textColor: '#333',
            },
            grid: {
              vertLines: { color: '#f0f3fa' },
              horzLines: { color: '#f0f3fa' },
            },
            crosshair: {
              mode: 1,
            },
            rightPriceScale: {
              borderColor: '#cccccc',
            },
            timeScale: {
              borderColor: '#cccccc',
              timeVisible: true,
            },
          })

          // Handle resize
          const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
              chartRef.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
              })
            }
          }

          window.addEventListener('resize', handleResize)
          
          // Fetch initial data if instrumentKey is available
          if (instrumentKey) {
            fetchChartData()
          }

          return () => {
            window.removeEventListener('resize', handleResize)
            if (chartRef.current) {
              chartRef.current.remove()
            }
          }
        } catch (error) {
          console.error('Error initializing chart:', error)
        }
      }
    }

    initChart()
  }, [])

  useEffect(() => {
    if (instrumentKey && chartRef.current) {
      fetchChartData()
    }
  }, [instrumentKey, interval, chartType, showVolume])

  const fetchChartData = async () => {
    if (!chartRef.current) return

    setLoading(true)
    try {
      const response = await apiClient.post('/chart-data', {
        instrument_key: instrumentKey,
        interval: interval,
        from_date: getFromDate(interval),
        to_date: new Date().toISOString().split('T')[0]
      })

      console.log('Chart data response:', response)

      // Clear existing series
      clearSeries()

      // Verify chart methods are available
      if (!chartRef.current.addCandlestickSeries) {
        console.error('Chart methods not available')
        return
      }

      // Add new series based on chart type
      if (chartType === 'candlestick') {
        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        })
        
        if (response.candlestick_data && response.candlestick_data.length > 0) {
          candlestickSeriesRef.current.setData(response.candlestick_data)
        }
      } else if (chartType === 'line') {
        lineSeriesRef.current = chartRef.current.addLineSeries({
          color: '#2196F3',
          lineWidth: 2,
        })
        
        if (response.candlestick_data && response.candlestick_data.length > 0) {
          const lineData = response.candlestick_data.map((item: any) => ({
            time: item.time,
            value: item.close
          }))
          lineSeriesRef.current.setData(lineData)
        }
      } else if (chartType === 'area') {
        areaSeriesRef.current = chartRef.current.addAreaSeries({
          topColor: 'rgba(33, 150, 243, 0.56)',
          bottomColor: 'rgba(33, 150, 243, 0.04)',
          lineColor: 'rgba(33, 150, 243, 1)',
          lineWidth: 2,
        })
        
        if (response.candlestick_data && response.candlestick_data.length > 0) {
          const areaData = response.candlestick_data.map((item: any) => ({
            time: item.time,
            value: item.close
          }))
          areaSeriesRef.current.setData(areaData)
        }
      }

      // Add volume series if enabled
      if (showVolume && response.volume_data && response.volume_data.length > 0) {
        volumeSeriesRef.current = chartRef.current.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        })
        volumeSeriesRef.current.setData(response.volume_data)
      }

      // Fit content
      chartRef.current.timeScale().fitContent()

    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSeries = () => {
    if (candlestickSeriesRef.current) {
      chartRef.current?.removeSeries(candlestickSeriesRef.current)
      candlestickSeriesRef.current = null
    }
    if (lineSeriesRef.current) {
      chartRef.current?.removeSeries(lineSeriesRef.current)
      lineSeriesRef.current = null
    }
    if (areaSeriesRef.current) {
      chartRef.current?.removeSeries(areaSeriesRef.current)
      areaSeriesRef.current = null
    }
    if (volumeSeriesRef.current) {
      chartRef.current?.removeSeries(volumeSeriesRef.current)
      volumeSeriesRef.current = null
    }
  }

  const getFromDate = (interval: string) => {
    const now = new Date()
    const days = interval.includes('minute') ? 7 : 365 // 7 days for intraday, 1 year for daily
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return fromDate.toISOString().split('T')[0]
  }

  if (!instrumentKey) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Select a stock to view its chart</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {instrumentName || instrumentKey}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervals.map((int) => (
                  <SelectItem key={int.value} value={int.value}>
                    {int.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showVolume ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
            >
              Volume
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading chart data...</p>
              </div>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-[500px]" />
        </div>
      </CardContent>
    </Card>
  )
}
