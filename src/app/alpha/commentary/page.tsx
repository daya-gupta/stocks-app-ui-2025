'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface UploadedImage {
  id: string;
  url: string;
  caption: string;
  image_ref: string;
  file?: File;
}

interface DraftPost {
  id?: string;
  post_type: 'DAILY_PERFORMANCE' | 'PORTFOLIO_UPDATE' | 'BEYOND_PORTFOLIO';
  title: string;
  content: string;
  images: UploadedImage[];
  portfolio_id?: string;
}

export default function CommentaryAdmin() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [draftPost, setDraftPost] = useState<DraftPost>({
    post_type: 'PORTFOLIO_UPDATE',
    title: '',
    content: '',
    images: [],
    portfolio_id: '639b2e7f-54bd-46ae-8b3c-9e944bf23dd8',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  // ============================================================================
  // IMAGE UPLOAD
  // ============================================================================
  const handleImageUpload = async (file: File) => {
    // Validate file size (1MB)
    if (file.size > 1048576) {
      setError('File size must be less than 1MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Allowed: jpg, png, webp');
      return;
    }

    try {
      setLoading(true);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Add to images list (will be uploaded when post is saved)
      const newImage: UploadedImage = {
        id: `temp-${Date.now()}`,
        url: previewUrl,
        caption: '',
        image_ref: `img-${Date.now()}`,
        file: file,
      };

      setDraftPost(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));

      setSuccess('Image added to draft');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SAVE DRAFT
  // ============================================================================
  const handleSaveDraft = async () => {
    if (!draftPost.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!draftPost.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Create post
      const postResult = await apiClient.post('/commentary/posts', {
        post_type: draftPost.post_type,
        title: draftPost.title,
        portfolio_id: draftPost.portfolio_id || null,
        content_json: {
          markdown_content: draftPost.content,
          images: draftPost.images.map(img => ({
            url: img.url,
            caption: img.caption
          }))
        }
      });

      if (postResult.id) {
        const savedPost = postResult;

        // Upload images
        for (const img of draftPost.images) {
          if (img.file) {
            await apiClient.uploadFile(
              `/commentary/posts/${savedPost.id}/images/upload`,
              img.file,
              { caption: img.caption }
            );
          }
        }

        setSuccess('Draft saved successfully!');
        setDraftPost({
          post_type: 'PORTFOLIO_UPDATE',
          title: '',
          content: '',
          images: [],
        });

        setTimeout(() => {
          setSuccess('');
        }, 3000);

        // Reload drafts
        loadDrafts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PUBLISH DRAFT
  // ============================================================================
  const handlePublish = async (postId: string) => {
    try {
      setLoading(true);
      setError('');

      const result = await apiClient.put(`/commentary/posts/${postId}`, {
        status: 'PUBLISHED'
      });

      if (result) {
        setSuccess('Post published successfully!');
        loadDrafts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LOAD DRAFTS
  // ============================================================================
  const loadDrafts = async () => {
    try {
      const result = await apiClient.get('/commentary/posts?status=DRAFT');
      if (result) {
        setDrafts(result);
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Commentary Admin</h1>
          <p className="text-gray-600">
            Create, edit, and manage portfolio commentary posts.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Post</h2>

          {/* Post Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Type <span className="text-red-500">*</span>
            </label>
            <select
              value={draftPost.post_type}
              onChange={(e) =>
                setDraftPost(prev => ({
                  ...prev,
                  post_type: e.target.value as any
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PORTFOLIO_UPDATE">Portfolio Update</option>
              <option value="DAILY_PERFORMANCE">Daily Performance</option>
              <option value="BEYOND_PORTFOLIO">Beyond Portfolio</option>
            </select>
          </div>

          {/* Portfolio ID (optional) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Portfolio ID (Optional)
            </label>
            <input
              type="text"
              value={draftPost.portfolio_id || ''}
              onChange={(e) =>
                setDraftPost(prev => ({
                  ...prev,
                  portfolio_id: e.target.value
                }))
              }
              placeholder="Leave empty for system-wide posts"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draftPost.title}
              onChange={(e) =>
                setDraftPost(prev => ({
                  ...prev,
                  title: e.target.value
                }))
              }
              placeholder="Enter post title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content (Markdown) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={draftPost.content}
              onChange={(e) =>
                setDraftPost(prev => ({
                  ...prev,
                  content: e.target.value
                }))
              }
              placeholder="Enter post content in markdown format..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40"
            />
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Images (Optional - Max 1MB each)
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Choose Image
            </button>

            {/* Image Preview */}
            {draftPost.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {draftPost.images.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={`Preview ${idx}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <input
                      type="text"
                      placeholder="Add caption"
                      value={img.caption}
                      onChange={(e) => {
                        const updated = [...draftPost.images];
                        updated[idx].caption = e.target.value;
                        setDraftPost(prev => ({
                          ...prev,
                          images: updated
                        }));
                      }}
                      className="mt-2 w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        setDraftPost(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx)
                        }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => {
                setDraftPost({
                  post_type: 'PORTFOLIO_UPDATE',
                  title: '',
                  content: '',
                  images: [],
                });
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Draft Posts */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Draft Posts
          </h2>

          {drafts.length === 0 ? (
            <p className="text-gray-500">No draft posts yet.</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {post.post_type} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      Publish
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {post.content_json?.markdown_content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
