'use client'

import { useState, useEffect } from 'react'
// import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { apiClient } from '@/lib/api'
import { Download, TrendingUp, BarChart3, Activity } from 'lucide-react'

interface PlotlyStockChartProps {
  instrumentKey: string
  instrumentName?: string
}

const intervals = [
  { value: '1minute', label: '1m' },
  { value: '5minute', label: '5m' },
  { value: '15minute', label: '15m' },
  { value: '30minute', label: '30m' },
  { value: 'day', label: '1D' },
  { value: 'week', label: '1W' }
]

const chartTypes = [
  { value: 'candlestick', label: 'Candlestick', icon: BarChart3 },
  { value: 'ohlc', label: 'OHLC', icon: Activity },
  { value: 'line', label: 'Line', icon: TrendingUp },
  { value: 'scatter', label: 'Scatter', icon: Activity }
]

export default function PlotlyStockChart({ instrumentKey, instrumentName }: PlotlyStockChartProps) {
  const [interval, setInterval] = useState('day')
  const [chartType, setChartType] = useState('candlestick')
  const [loading, setLoading] = useState(false)
  const [showVolume, setShowVolume] = useState(true)
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (instrumentKey) {
      fetchChartData()
    }
  }, [instrumentKey, interval])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      const deliveryPayload = {
        filter: {
          instruments: [instrumentKey],
        //   interval: interval === 'day' ? 'day' : 'day', // Use day for now, can be enhanced
          interval,
          from_date: getFromDate(interval),
          to_date: new Date().toISOString().split('T')[0]
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/historicalDataUpstox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deliveryPayload)
      });

      const data = await response.json();
      
      // Transform data for Plotly
      const transformedData = transformHistoricalData(data);
      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformHistoricalData = (data: any[]) => {
    if (!data || !data[0] || !data[0].candles) return null;

    const candles = data[0].candles;
    const candlestickData = [];
    const volumeData = [];

    // Reverse candles to get chronological order
    for (let i = candles.length - 1; i >= 0; i--) {
      const candle = candles[i];
      const timestamp = candle[0];
      const open = parseFloat(candle[1]);
      const high = parseFloat(candle[2]);
      const low = parseFloat(candle[3]);
      const close = parseFloat(candle[4]);
      const volume = parseInt(candle[5]);

      // Convert timestamp to epoch seconds
      let epochTime;
      if (timestamp.includes('T')) {
        epochTime = new Date(timestamp).getTime() / 1000;
      } else {
        epochTime = new Date(timestamp + 'T00:00:00Z').getTime() / 1000;
      }

      candlestickData.push({
        time: epochTime,
        open,
        high,
        low,
        close
      });

      volumeData.push({
        time: epochTime,
        value: volume,
        color: close >= open ? '#26a69a' : '#ef5350'
      });
    }

    return {
      candlestick_data: candlestickData,
      volume_data: volumeData,
      instrument_key: instrumentKey
    };
  }

  const getFromDate = (interval: string) => {
    const now = new Date()
    let days = interval.includes('minute') ? 7 : 365
    if (interval.includes('week')) {
        days = 365 * 5;
    };
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return fromDate.toISOString().split('T')[0]
  }

  const createPlotData = () => {
    if (!chartData?.candlestick_data) return []

    const data = chartData.candlestick_data
    const dates = data.map((item: any) => new Date(item.time * 1000))
    
    const traces: any[] = []

    // Main price chart
    if (chartType === 'candlestick') {
      traces.push({
        type: 'candlestick',
        x: dates,
        open: data.map((item: any) => item.open),
        high: data.map((item: any) => item.high),
        low: data.map((item: any) => item.low),
        close: data.map((item: any) => item.close),
        name: 'Price',
        increasing: { line: { color: '#26a69a' } },
        decreasing: { line: { color: '#ef5350' } },
        yaxis: 'y'
      })
    } else if (chartType === 'ohlc') {
      traces.push({
        type: 'ohlc',
        x: dates,
        open: data.map((item: any) => item.open),
        high: data.map((item: any) => item.high),
        low: data.map((item: any) => item.low),
        close: data.map((item: any) => item.close),
        name: 'OHLC',
        increasing: { line: { color: '#26a69a' } },
        decreasing: { line: { color: '#ef5350' } },
        yaxis: 'y'
      })
    } else if (chartType === 'line') {
      traces.push({
        type: 'scatter',
        mode: 'lines',
        x: dates,
        y: data.map((item: any) => item.close),
        name: 'Close Price',
        line: { color: '#2196F3', width: 2 },
        yaxis: 'y'
      })
    } else if (chartType === 'scatter') {
      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: dates,
        y: data.map((item: any) => item.close),
        name: 'Close Price',
        marker: { color: '#2196F3', size: 4 },
        yaxis: 'y'
      })
    }

    // Volume chart
    if (showVolume && chartData.volume_data) {
      traces.push({
        type: 'bar',
        x: dates,
        y: chartData.volume_data.map((item: any) => item.value),
        name: 'Volume',
        marker: {
          color: data.map((item: any, index: number) => 
            item.close >= item.open ? '#26a69a' : '#ef5350'
          ),
          opacity: 0.7
        },
        yaxis: 'y2'
      })
    }

    return traces
  }

  const getLayout = () => ({
    title: {
      text: `${instrumentName || instrumentKey} - ${chartType.toUpperCase()}`,
      font: { size: 18 }
    },
    xaxis: {
      title: 'Time',
      rangeslider: { visible: false },
      type: 'date'
    },
    yaxis: {
      title: 'Price (₹)',
      domain: showVolume ? [0.3, 1] : [0, 1],
      side: 'right'
    },
    ...(showVolume && {
      yaxis2: {
        title: 'Volume',
        domain: [0, 0.25],
        side: 'right'
      }
    }),
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { l: 10, r: 60, t: 60, b: 50 },
    height: 600,
    showlegend: true,
    legend: { orientation: 'h', x: 0, y: 1.02 },
    hovermode: 'x unified'
  })

  const getConfig = () => ({
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToAdd: [
      {
        name: 'Download PNG',
        icon: {
          'width': 1792,
          'height': 1792,
          'path': 'M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h465l135 136q58 56 136 56t136-56l136-136h464q40 0 68 28t28 68zm-325-569q17 41-14 70l-448 448q-18 19-45 19t-45-19l-448-448q-31-29-14-70 17-39 59-39h256v-448q0-26 19-45t45-19h256q26 0 45 19t19 45v448h256q42 0 59 39z',
          'transform': 'matrix(1 0 0 -1 0 1792)'
        },
        click: () => {
          // Custom download logic can be added here
          console.log('Downloading chart...')
        }
      }
    ],
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    responsive: true
  })

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
        <div className="flex flex-wrap justify-between items-center gap-4">
          <CardTitle className="text-xl">
            {instrumentName || instrumentKey}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4">
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
                    <div className="flex items-center">
                      <type.icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </div>
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
          
          {/* {chartData && (
            <Plot
              data={createPlotData()}
              layout={getLayout()}
              config={getConfig()}
              style={{ width: '100%', height: '600px' }}
            />
          )} */}
        </div>
      </CardContent>
    </Card>
  )
}
