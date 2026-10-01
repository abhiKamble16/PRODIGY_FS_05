import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postService } from '../services/api';
import Sidebar from '../components/Sidebar';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';
import { Loader2, Hash, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchFeedData = useCallback(async () => {
    try {
      setError('');
      const params = {};
      if (activeTag) {
        params.tag = activeTag;
      }

      const [postsRes, tagsRes] = await Promise.all([
        postService.getAllPosts(params),
        postService.getTrendingTags(),
      ]);

      if (postsRes.data.success) {
        setPosts(postsRes.data.posts);
      }
      if (tagsRes.data.success) {
        setTrendingTags(tagsRes.data.tags);
      }
    } catch (err) {
      console.error('Failed to fetch feed data:', err);
      setError('Failed to load feed. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTag]);

  useEffect(() => {
    setLoading(true);
    fetchFeedData();
  }, [fetchFeedData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeedData();
  };

  const handlePostCreated = (newPost) => {
    // Add new post to top of feed
    setPosts((prev) => [newPost, ...prev]);
    // Refresh trending tags in background
    postService.getTrendingTags().then((res) => {
      if (res.data.success) setTrendingTags(res.data.tags);
    });
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handleTagClick = (tag) => {
    const clean = tag.replace(/^#/, '');
    if (activeTag === clean) {
      searchParams.delete('tag');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tag: clean });
    }
  };

  const handleClearTagFilter = () => {
    searchParams.delete('tag');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <Sidebar
              trendingTags={trendingTags}
              onTagClick={handleTagClick}
              activeTag={activeTag ? `#${activeTag}` : null}
            />
          </div>
        </div>

        {/* Center Main Feed */}
        <div className="col-span-1 lg:col-span-3 max-w-2xl mx-auto w-full">
          {/* Create Post Component */}
          <CreatePostBox onPostCreated={handlePostCreated} />

          {/* Active Tag Filter Banner */}
          {activeTag && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl mb-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-medium">
                <Hash className="w-4 h-4 text-blue-600" />
                <span>
                  Filtering by tag: <span className="font-bold">#{activeTag}</span>
                </span>
              </div>
              <button
                onClick={handleClearTagFilter}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* Feed Header with Refresh */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h1 className="text-base font-bold text-slate-900">
              {activeTag ? `Posts tagged with #${activeTag}` : 'Recent Posts'}
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh feed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Posts Feed / Loading / Empty States */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-gray-200 p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium text-slate-600">Loading feed...</p>
              <p className="text-xs text-slate-400 mt-1">Fetching latest posts from database</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                {activeTag ? `No posts found for #${activeTag}` : 'No posts yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {activeTag
                  ? 'Try selecting a different hashtag or clearing the filter.'
                  : 'Be the first one to share a post with the community! Use the box above.'}
              </p>
              {activeTag && (
                <button
                  onClick={handleClearTagFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  View All Posts
                </button>
              )}
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDeleted}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
