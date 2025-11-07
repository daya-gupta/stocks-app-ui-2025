'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Calculator } from 'lucide-react'
import { apiClient } from '@/lib/api'
import AutoCompletex from './AutoCompletex'

interface TransactionFormProps {
  portfolioIds: string[]
  onSubmit: () => void
  onCancel: () => void
}

export default function TransactionForm({ portfolioIds, onSubmit, onCancel }: TransactionFormProps) {
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [formData, setFormData] = useState({
    portfolioId: portfolioIds[0] || '',
    transactionType: 'BUY',
    quantity: '',
    price: '',
    brokerage: '0',
    taxes: '0',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const totalAmount = parseFloat(formData.quantity || '0') * parseFloat(formData.price || '0') + 
                     parseFloat(formData.brokerage || '0') + parseFloat(formData.taxes || '0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStock) return

    setLoading(true)
    try {
      await apiClient.post(`/portfolios/${formData.portfolioId}/transactions`, {
        instrument_key: selectedStock.instrument_key || selectedStock.isin,
        instrument_name: selectedStock.name,
        transaction_type: formData.transactionType,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        brokerage: parseFloat(formData.brokerage),
        taxes: parseFloat(formData.taxes),
        transaction_date: formData.transactionDate,
        notes: formData.notes
      })
      onSubmit()
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Transaction</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Stock</label>
              <AutoCompletex onSelect={setSelectedStock} />
              {selectedStock && (
                <p className="text-sm text-gray-600 mt-1">Selected: {selectedStock.name}</p>
              )}
            </div>

            {portfolioIds.length > 1 && (
              <div>
                <label className="text-sm font-medium">Portfolio</label>
                <Select value={formData.portfolioId} onValueChange={(value) => setFormData({...formData, portfolioId: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolioIds.map((id) => (
                      <SelectItem key={id} value={id}>Portfolio {id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transaction Type</label>
                <Select value={formData.transactionType} onValueChange={(value) => setFormData({...formData, transactionType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price per unit</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Brokerage</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.brokerage}
                  onChange={(e) => setFormData({...formData, brokerage: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Taxes</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.taxes}
                  onChange={(e) => setFormData({...formData, taxes: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Transaction notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Calculator className="w-4 h-4 mr-1" />
                  Total Amount
                </span>
                <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1" disabled={loading || !selectedStock}>
                {loading ? 'Adding...' : 'Add Transaction'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
