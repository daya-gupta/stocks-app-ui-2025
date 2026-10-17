'use client'

import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createChart } from "lightweight-charts";

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
  const isInitializedRef = useRef(false)

  const [interval, setInterval] = useState('day')
  const [chartType, setChartType] = useState('candlestick')
  const [loading, setLoading] = useState(false)
  const [showVolume, setShowVolume] = useState(true)

  // Initialize chart once on mount
  useEffect(() => {
    if (isInitializedRef.current || !chartContainerRef.current) return

    let isMounted = true
    let resizeHandler: (() => void) | null = null

    const initChart = async () => {
      try {
        
        if (!isMounted || !chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 600,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#666',
            fontSize: 12,
          },
          grid: {
            vertLines: { color: '#f0f3fa', style: 1 },
            horzLines: { color: '#f0f3fa', style: 1 },
          },
          crosshair: {
            mode: 1,
            vertLine: {
              color: '#6c757d',
              width: 1,
              style: 1,
            },
            horzLine: {
              color: '#6c757d',
              width: 1,
              style: 1,
            },
          },
          rightPriceScale: {
            borderColor: '#cccccc',
            scaleMargins: {
              top: 0.1,
              bottom: 0.25,
            },
          },
          timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
          },
        })

        chartRef.current = chart
        isInitializedRef.current = true

        // Handle window resize
        resizeHandler = () => {
          if (chartRef.current && chartContainerRef.current && isMounted) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
            })
          }
        }

        window.addEventListener('resize', resizeHandler)
      } catch (error) {
        console.error('Error initializing chart:', error)
      }
    }

    initChart()

    return () => {
      isMounted = false
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
      }
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {
          console.warn('Error removing chart:', e)
        }
        chartRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [])

  // Fetch data when instrumentKey or settings change
  useEffect(() => {
    if (instrumentKey && chartRef.current && isInitializedRef.current) {
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

      // Clear existing series
      clearSeries()

      if (!chartRef.current.addCandlestickSeries) {
        console.error('Chart methods not available')
        return
      }

      // Add price series based on chart type
      if (chartType === 'candlestick') {
        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        })
        
        if (response.candlestick_data?.length > 0) {
          candlestickSeriesRef.current.setData(response.candlestick_data)
        }
      } else if (chartType === 'line') {
        lineSeriesRef.current = chartRef.current.addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
          crosshairMarkerVisible: true,
        })
        
        if (response.candlestick_data?.length > 0) {
          const lineData = response.candlestick_data.map((item: any) => ({
            time: item.time,
            value: item.close
          }))
          lineSeriesRef.current.setData(lineData)
        }
      } else if (chartType === 'area') {
        areaSeriesRef.current = chartRef.current.addAreaSeries({
          topColor: 'rgba(59, 130, 246, 0.28)',
          bottomColor: 'rgba(59, 130, 246, 0.05)',
          lineColor: 'rgba(59, 130, 246, 1)',
          lineWidth: 2,
          crosshairMarkerVisible: true,
        })
        
        if (response.candlestick_data?.length > 0) {
          const areaData = response.candlestick_data.map((item: any) => ({
            time: item.time,
            value: item.close
          }))
          areaSeriesRef.current.setData(areaData)
        }
      }

      // Add volume series on separate price scale to avoid overlap
      if (showVolume && response.volume_data?.length > 0) {
        volumeSeriesRef.current = chartRef.current.addHistogramSeries({
          color: 'rgba(16, 185, 129, 0.6)',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume', // Separate price scale for volume
          scaleMargins: {
            top: 0.75, // Volume takes bottom 25% of chart
            bottom: 0,
          },
        })
        
        // Create and attach the volume price scale
        chartRef.current.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.75,
            bottom: 0,
          },
        })

        volumeSeriesRef.current.setData(response.volume_data)
      }

      // Fit content to window
      if (chartRef.current.timeScale()) {
        chartRef.current.timeScale().fitContent()
      }

    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSeries = () => {
    try {
      if (candlestickSeriesRef.current && chartRef.current) {
        chartRef.current.removeSeries(candlestickSeriesRef.current)
        candlestickSeriesRef.current = null
      }
      if (lineSeriesRef.current && chartRef.current) {
        chartRef.current.removeSeries(lineSeriesRef.current)
        lineSeriesRef.current = null
      }
      if (areaSeriesRef.current && chartRef.current) {
        chartRef.current.removeSeries(areaSeriesRef.current)
        areaSeriesRef.current = null
      }
      if (volumeSeriesRef.current && chartRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current)
        volumeSeriesRef.current = null
      }
    } catch (error) {
      console.error('Error clearing series:', error)
    }
  }

  const getFromDate = (interval: string) => {
    const now = new Date()
    const days = interval.includes('minute') ? 7 : 365
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return fromDate.toISOString().split('T')[0]
  }

  if (!instrumentKey) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-gray-500">Select a stock to view its chart</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {instrumentName || instrumentKey}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-[100px] bg-white border-gray-300">
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
              <SelectTrigger className="w-[130px] bg-white border-gray-300">
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
              className={showVolume ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Volume
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative bg-white rounded-md overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-600 font-medium">Loading chart...</p>
              </div>
            </div>
          )}
          <div 
            ref={chartContainerRef} 
            className="w-full bg-white" 
            style={{ height: '600px' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
