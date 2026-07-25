'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
import { apiClient } from '@/lib/api';

interface Snapshot {
  id: string;
  portfolio_id: string;
  snapshot_date: string;
  portfolio_value: number;
  portfolio_return: number;
  indices_data: Array<{
    name: string;
    value: number;
    return_pct: number;
  }>;
  holdings_snapshot: Array<{
    instrument_key: string;
    current_price: number;
    return_pct: number;
  }>;
  created_at: string;
}

interface CommentaryPost {
  id: string;
  post_type: 'DAILY_PERFORMANCE' | 'PORTFOLIO_UPDATE' | 'BEYOND_PORTFOLIO';
  title: string;
  content_json?: {
    markdown_content: string;
    html_table?: string;
    images?: Array<{ url: string; caption?: string }>;
    metrics?: {
      portfolio_return?: number;
      benchmark_return?: number;
      outperformance?: number;
    };
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  published_at: string;
  created_at: string;
}

export default function PortfolioCommentary() {
  // const router = useRouter();
  const [activeTab, setActiveTab] = useState<'performance' | 'updates' | 'beyond' | 'admin'>('performance');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [posts, setPosts] = useState<CommentaryPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolioId, setPortfolioId] = useState('639b2e7f-54bd-46ae-8b3c-9e944bf23dd8');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // if (!token) {
    //   router.push('/auth/login');
    //   return;
    // }
    loadData();
  }, [portfolioId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (portfolioId) {
        // Fetch snapshots
        const snapshotResult = await apiClient.get(`/commentary/snapshots?portfolio_id=${portfolioId}`);
        if (snapshotResult) {
          setSnapshots(snapshotResult);
        }

        // Fetch commentary posts
        const postsResult = await apiClient.get(`/commentary/posts?portfolio_id=${portfolioId}&status=PUBLISHED`);
        if (postsResult) {
          // setPosts(postsResult);
          const formattedPostResult = postsResult.map((post: any) => {
            console.log('..............', post.content_json, typeof post.content_json);
            // TBD: Backend should ideally return content_json as already parsed JSON. If it's a string, we parse it here. This is a temporary fix until backend is updated.
            if (typeof (post.content_json) === 'string') {
              post.content_json = JSON.parse(post.content_json);
            }
            if (typeof (post.indices_data) === 'string') {
              post.indices_data = JSON.parse(post.indices_data);
            }
            if (typeof (post.holdings_snapshot) === 'string') {
              post.holdings_snapshot = JSON.parse(post.holdings_snapshot);
            }
            return post;
          })
          setPosts(formattedPostResult);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DAILY PERFORMANCE SECTION
  // ============================================================================
  const PerformanceSection = () => {
    if (!snapshots.length) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No performance snapshots available yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {snapshots.map((snapshot) => {
          const post = posts.find((p) => p.post_type === 'DAILY_PERFORMANCE' && p.published_at?.includes(snapshot.snapshot_date));

          return (
            <div key={snapshot.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {new Date(snapshot.snapshot_date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Daily Performance Summary</p>
                </div>
                <div className={`text-right ${snapshot.portfolio_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="text-3xl font-bold">
                    {snapshot.portfolio_return >= 0 ? '+' : ''}
                    {snapshot.portfolio_return.toFixed(2)}%
                  </div>
                  <p className="text-sm">Portfolio Return</p>
                </div>
              </div>

              {/* Portfolio Value & Commentary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Portfolio Value</p>
                  <p className="text-2xl font-semibold">₹{snapshot.portfolio_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Market Indices</p>
                  <div className="text-sm space-y-1 mt-2">
                    {/* {snapshot.indices_data.map((idx, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="font-medium">{idx.name}:</span>
                        <span className={idx.return_pct >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {idx.return_pct >= 0 ? '+' : ''}
                          {idx.return_pct.toFixed(2)}%
                        </span>
                      </div>
                    ))} */}
                  </div>
                </div>
              </div>

              {/* Holdings Table */}
              {snapshot.holdings_snapshot.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Holdings Performance</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-3">Symbol</th>
                          <th className="text-right p-3">Current Price</th>
                          <th className="text-right p-3">Daily Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* {snapshot.holdings_snapshot.map((holding, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{holding.instrument_key}</td>
                            <td className="text-right p-3">₹{holding.current_price.toFixed(2)}</td>
                            <td className={`text-right p-3 font-semibold ${holding.return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.return_pct >= 0 ? '+' : ''}
                              {holding.return_pct.toFixed(2)}%
                            </td>
                          </tr>
                        ))} */}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Commentary */}
              {post?.content_json?.markdown_content && (
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content_json.markdown_content}</p>
                </div>
              )}

              {/* Images */}
              {post?.content_json?.images && post.content_json.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {post.content_json.images.map((img, i) => (
                    <div key={i} className="rounded overflow-hidden border">
                      <img
                        src={img.url}
                        alt={img.caption || 'Commentary image'}
                        className="w-full h-auto"
                      />
                      {img.caption && (
                        <p className="text-xs text-gray-600 p-2 bg-gray-50">{img.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // PORTFOLIO UPDATES SECTION
  // ============================================================================
  const UpdatesSection = () => {
    const updates = posts.filter((p) => p.post_type === 'PORTFOLIO_UPDATE');

    if (!updates.length) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No portfolio updates available yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{update.title}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {new Date(update.published_at).toLocaleDateString('en-IN')}
            </p>
            <p className="text-gray-700 mb-4">{update.content_json?.markdown_content}</p>

            {update.content_json?.images && update.content_json.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {update.content_json.images.map((img, i) => (
                  <div key={i} className="rounded overflow-hidden border">
                    <img
                      src={img.url}
                      alt={img.caption || 'Update image'}
                      className="w-full h-auto"
                    />
                    {img.caption && (
                      <p className="text-xs text-gray-600 p-2 bg-gray-50">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ============================================================================
  // BEYOND PORTFOLIO SECTION
  // ============================================================================
  const BeyondPortfolioSection = () => {
    const beyond = posts.filter((p) => p.post_type === 'BEYOND_PORTFOLIO');

    if (!beyond.length) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No market insights available yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {beyond.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {new Date(item.published_at).toLocaleDateString('en-IN')}
            </p>
            {/* <p className="text-gray-700 mb-4">{item.content_json?.markdown_content}</p> */}
            <p className="text-gray-700 mb-4">{item.content_json?.markdown_content}</p>

            {item.content_json?.images && item.content_json.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {item.content_json.images.map((img, i) => (
                  <div key={i} className="rounded overflow-hidden border">
                    <img
                      src={img.url}
                      alt={img.caption || 'Insight image'}
                      className="w-full h-auto"
                    />
                    {img.caption && (
                      <p className="text-xs text-gray-600 p-2 bg-gray-50">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Portfolio Commentary</h1>
          <p className="text-gray-600">
            Track daily performance, updates, and market insights for your model portfolio.
          </p>
        </div>

        {/* Portfolio Selector */}
        {/* <div className="mb-6">
          <input
            type="text"
            placeholder="Enter Portfolio ID"
            value={portfolioId}
            onChange={(e) => setPortfolioId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}

        {/* Tabs */}
        <div className="flex gap-2 mt-2 border-b border-gray-200">
          {[
            { id: 'performance', label: '📈 Daily Performance' },
            { id: 'updates', label: '📰 Portfolio Updates' },
            { id: 'beyond', label: '🌟 Beyond Portfolio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && <p className="text-center text-gray-500">Loading...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              {activeTab === 'performance' && <PerformanceSection />}
              {activeTab === 'updates' && <UpdatesSection />}
              {activeTab === 'beyond' && <BeyondPortfolioSection />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
