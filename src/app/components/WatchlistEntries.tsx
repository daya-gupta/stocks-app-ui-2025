'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit, Save, X } from 'lucide-react'
import AutoCompletex from './AutoCompletex'

interface WatchlistEntry {
  id: string
  watchlist_id: string
  instrument_key: string
  notes?: string
  created_at: string
}

interface WatchlistEntriesProps {
  watchlistIds: string[]
}

export default function WatchlistEntries({ watchlistIds }: WatchlistEntriesProps) {
  const [entries, setEntries] = useState<WatchlistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [newNotes, setNewNotes] = useState('')

  useEffect(() => {
    if (watchlistIds.length > 0) {
      fetchEntries()
    }
  }, [watchlistIds])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const allEntries: WatchlistEntry[] = []
      for (const watchlistId of watchlistIds) {
        const data = await apiClient.get(`/watchlists/${watchlistId}/entries`)
        allEntries.push(...data)
      }
      setEntries(allEntries)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async () => {
    if (!selectedStock || watchlistIds.length === 0) return
    
    try {
      await apiClient.post(`/watchlists/${watchlistIds[0]}/entries`, {
        instrument_key: selectedStock.instrument_key,
        notes: newNotes
      })
      fetchEntries()
      setShowAddForm(false)
      setSelectedStock(null)
      setNewNotes('')
    } catch (error) {
      console.error('Error adding stock:', error)
    }
  }

  const handleRemoveStock = async (watchlistId: string, instrumentKey: string) => {
    if (confirm('Are you sure you want to remove this stock?')) {
      try {
        await apiClient.delete(`/watchlists/${watchlistId}/entries/${encodeURIComponent(instrumentKey)}`)
        fetchEntries()
      } catch (error) {
        console.error('Error removing stock:', error)
      }
    }
  }

  const handleUpdateNotes = async (watchlistId: string, instrumentKey: string) => {
    try {
      await apiClient.put(`/watchlists/${watchlistId}/entries/${encodeURIComponent(instrumentKey)}`, {
        notes: editNotes
      })
      fetchEntries()
      setEditingEntry(null)
      setEditNotes('')
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  const startEditing = (entry: WatchlistEntry) => {
    setEditingEntry(entry.id)
    setEditNotes(entry.notes || '')
  }

  if (loading) {
    return <div className="text-center py-4">Loading entries...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Stocks ({entries.length})</h3>
        <Button onClick={() => setShowAddForm(true)} disabled={watchlistIds.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Stock to Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <AutoCompletex onSelect={setSelectedStock} />
              {selectedStock && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedStock.name}
                </p>
              )}
            </div>
            <Textarea
              placeholder="Notes (optional)"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleAddStock} disabled={!selectedStock}>
                Add Stock
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {entries.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{entry.instrument_key}</h4>
                  {editingEntry === entry.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add notes..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateNotes(entry.watchlist_id, entry.instrument_key)}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEntry(null)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(entry)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStock(entry.watchlist_id, entry.instrument_key)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500">No stocks in selected watchlists</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
