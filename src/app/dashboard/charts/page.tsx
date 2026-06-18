'use client'

import { useState } from 'react'
import PlotlyStockChart from '@/app/components/PlotlyStockChart'
import AutoCompletex from '@/app/components/AutoCompletex'
// import { Card, CardContent } from '@/components/ui/card'

const defaultInstrumentKey = 'NSE_INDEX|Nifty 50';

const ChartPage = () => {
    const [selectedStock, setSelectedStock] = useState<any>(null)

    return (
        <div className="space-y-6">
            <div className="">
                <div className="w-64">
                    <AutoCompletex onSelect={setSelectedStock} />
                </div>
            </div>
            
            <PlotlyStockChart 
                instrumentKey={selectedStock?.instrument_key || defaultInstrumentKey}
                instrumentName={selectedStock?.name || 'Nifty 50'}
            />

            {/* {selectedStock ? (
                <PlotlyStockChart 
                    instrumentKey={selectedStock.instrument_key || selectedStock.isin}
                    instrumentName={selectedStock.name}
                />
            ) : (
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <p className="text-gray-500">Select a stock to view its interactive chart</p>
                    </CardContent>
                </Card>
            )} */}

            {/* Feature Comparison Section */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-3">Plotly.js Features</h3>
                        <ul className="space-y-2 text-sm">
                            <li>✅ Fully interactive (zoom, pan, hover)</li>
                            <li>✅ Multiple chart types</li>
                            <li>✅ Volume overlay</li>
                            <li>✅ Technical indicators</li>
                            <li>✅ Export capabilities</li>
                            <li>✅ Mobile responsive</li>
                            <li>✅ Open source & free</li>
                        </ul>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-3">Best Use Cases</h3>
                        <ul className="space-y-2 text-sm">
                            <li>📊 Detailed technical analysis</li>
                            <li>🔍 Interactive data exploration</li>
                            <li>📈 Custom indicator development</li>
                            <li>💾 Chart export & sharing</li>
                            <li>📱 Cross-platform compatibility</li>
                            <li>🎨 Full customization control</li>
                        </ul>
                    </CardContent>
                </Card>
            </div> */}
        </div>
    );
}

export default ChartPage;