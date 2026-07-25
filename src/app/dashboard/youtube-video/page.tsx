'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface YouTubeVideo {
  id: number
  video_id: string
  title: string
  description?: string
  channel_name?: string
  published_at?: string
  duration?: number
  thumbnail_url?: string
  video_type?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export default function YoutubeVideoPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await apiClient.get('/videos')
      setVideos(response)
    } catch (err) {
      console.error('Error fetching videos:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!url.trim()) {
        setError('Please enter a YouTube URL')
        setLoading(false)
        return
      }

      const response = await apiClient.post('/admin/videos', {
        url: url.trim()
      })

      if (!response.id) {
        setError(`${response?.detail}. Failed to add video.`);
        return;
      }

      setSuccess(`Video "${response.title}" added successfully!`)
      setUrl('')
      setVideos([response, ...videos])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add video')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?si=${videoId}`
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube Videos</h1> */}
          <p className="text-gray-600 text-2xl">Curated YouTube content for stock market education</p>
        </div>

        {/* Admin Submit Form */}
        {/* <Card className="mb-8 shadow-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">
              📹 Submit YouTube Video (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  type="url"
                  placeholder="Paste YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-white border-gray-300"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 whitespace-nowrap"
                >
                  {loading ? 'Adding...' : 'Add Video'}
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  ✓ {success}
                </div>
              )}
            </form>
          </CardContent>
        </Card> */}

        {/* Video Gallery */}
        {selectedVideo ? (
          // Video Player View
          <Card className="mb-8 shadow-lg">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedVideo(null)}
                className="mb-4"
              >
                ← Back to Gallery
              </Button>

              <div className="bg-black rounded-lg overflow-hidden aspect-video mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(selectedVideo.video_id)}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">{selectedVideo.title}</h2>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {selectedVideo.channel_name && (
                    <div>
                      <span className="font-semibold">Channel:</span> {selectedVideo.channel_name}
                    </div>
                  )}
                  {selectedVideo.duration && (
                    <div>
                      <span className="font-semibold">Duration:</span> {formatDuration(selectedVideo.duration)}
                    </div>
                  )}
                  {selectedVideo.published_at && (
                    <div>
                      <span className="font-semibold">Published:</span> {new Date(selectedVideo.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {selectedVideo.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </div>
                )}

                {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Gallery Grid View
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📚 Video Library ({videos.length})
            </h2>

            {videos.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="flex items-center justify-center h-48">
                  <p className="text-gray-500 text-lg">No videos yet. Admin can add videos using the form above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden h-full flex flex-col hover:border-blue-300"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {/* Thumbnail */}
                    {video.thumbnail_url && (
                      <div className="relative aspect-video bg-gray-200 overflow-hidden">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    <CardContent className="flex-1 flex flex-col pt-4">
                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                        {video.title}
                      </h3>

                      {/* Channel */}
                      {video.channel_name && (
                        <p className="text-sm text-gray-600 mb-2">{video.channel_name}</p>
                      )}

                      {/* Metadata */}
                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        {video.duration && (
                          <p>⏱️ {formatDuration(video.duration)}</p>
                        )}
                        {video.published_at && (
                          <p>📅 {new Date(video.published_at).toLocaleDateString()}</p>
                        )}
                      </div>

                      {/* Description preview */}
                      {video.description && (
                        <p className="text-sm text-gray-700 flex-1 line-clamp-2 mb-3">
                          {video.description}
                        </p>
                      )}

                      {/* Tags */}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {video.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {video.tags.length > 3 && (
                            <span className="text-gray-500 text-xs px-2 py-1">
                              +{video.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* View Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Watch Video →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
