'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Edit } from 'lucide-react'
import WatchlistForm from '@/app/components/WatchlistForm'
import WatchlistEntries from '@/app/components/WatchlistEntries'
import WatchlistHistory from '@/app/components/WatchlistHistory'

interface Watchlist {
  id: string
  name: string
  description?: string
  tags: string[]
  created_at: string
}

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [selectedWatchlists, setSelectedWatchlists] = useState<string[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null)

  useEffect(() => {
    fetchWatchlists()
  }, [])

  const fetchWatchlists = async () => {
    try {
      const data = await apiClient.get('/watchlists')
      setWatchlists(data)
    } catch (error) {
      console.error('Error fetching watchlists:', error)
    }
  }

  const handleCreateWatchlist = async (data: any) => {
    try {
      await apiClient.post('/watchlists', data)
      fetchWatchlists()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating watchlist:', error)
    }
  }

  const handleDeleteWatchlist = async (id: string) => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      try {
        await apiClient.delete(`/watchlists/${id}`)
        fetchWatchlists()
      } catch (error) {
        console.error('Error deleting watchlist:', error)
      }
    }
  }

  const toggleWatchlistSelection = (id: string) => {
    setSelectedWatchlists(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Watchlists</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Watchlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="space-y-4">
            {watchlists.map(watchlist => (
              <Card key={watchlist.id} className={`cursor-pointer transition-all ${
                selectedWatchlists.includes(watchlist.id) ? 'ring-2 ring-blue-500' : ''
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle 
                      className="text-lg"
                      onClick={() => toggleWatchlistSelection(watchlist.id)}
                    >
                      {watchlist.name}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingWatchlist(watchlist)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWatchlist(watchlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {watchlist.description && (
                    <p className="text-sm text-gray-600 mb-2">{watchlist.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {watchlist.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedWatchlists.length > 0 ? (
            <Tabs defaultValue="stocks" className="w-full">
              <TabsList>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="stocks">
                <WatchlistEntries watchlistIds={selectedWatchlists} />
              </TabsContent>
              <TabsContent value="history">
                <WatchlistHistory watchlistIds={selectedWatchlists} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-gray-500">Select one or more watchlists to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {(showCreateForm || editingWatchlist) && (
        <WatchlistForm
          watchlist={editingWatchlist}
          onSubmit={handleCreateWatchlist}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingWatchlist(null)
          }}
        />
      )}
    </div>
  )
}
