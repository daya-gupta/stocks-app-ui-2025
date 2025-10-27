'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Plus, Minus, Edit, Trash } from 'lucide-react'

interface HistoryEntry {
  id: string
  watchlist_id: string
  action: string
  instrument_key?: string
  old_value?: string
  new_value?: string
  created_at: string
}

interface WatchlistHistoryProps {
  watchlistIds: string[]
}

export default function WatchlistHistory({ watchlistIds }: WatchlistHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (watchlistIds.length > 0) {
      fetchHistory()
    }
  }, [watchlistIds])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const watchlistIdsParam = watchlistIds.join(',')
      const data = await apiClient.get(`/watchlists/history?watchlist_ids=${watchlistIdsParam}`)
      setHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-500" />
      case 'deleted':
        return <Trash className="w-4 h-4 text-red-500" />
      case 'added_stock':
        return <Plus className="w-4 h-4 text-blue-500" />
      case 'removed_stock':
        return <Minus className="w-4 h-4 text-red-500" />
      case 'updated_notes':
        return <Edit className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionText = (entry: HistoryEntry) => {
    switch (entry.action) {
      case 'created':
        return 'Watchlist created'
      case 'deleted':
        return 'Watchlist deleted'
      case 'added_stock':
        return `Added stock: ${entry.instrument_key}`
      case 'removed_stock':
        return `Removed stock: ${entry.instrument_key}`
      case 'updated_notes':
        return `Updated notes for: ${entry.instrument_key}`
      default:
        return entry.action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
      case 'added_stock':
        return 'bg-green-100 text-green-800'
      case 'deleted':
      case 'removed_stock':
        return 'bg-red-100 text-red-800'
      case 'updated_notes':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading history...</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity History</h3>

      <div className="space-y-2">
        {history.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getActionIcon(entry.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {getActionText(entry)}
                    </p>
                    <Badge 
                      className={`text-xs ${getActionColor(entry.action)}`}
                      variant="secondary"
                    >
                      {entry.action.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {entry.action === 'updated_notes' && (
                    <div className="mt-2 text-xs text-gray-600">
                      {entry.old_value && (
                        <div className="mb-1">
                          <span className="font-medium">Old:</span> {entry.old_value}
                        </div>
                      )}
                      {entry.new_value && (
                        <div>
                          <span className="font-medium">New:</span> {entry.new_value}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500">No activity history available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
