import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '../services/api';
import UserCard from '../components/UserCard';
import { Search, Users as UsersIcon, Loader2, Sparkles } from 'lucide-react';

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async (query) => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getAllUsers(query);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(urlSearch);
  }, [urlSearch, fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleFollowToggle = (targetUserId, isNowFollowing) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id === targetUserId) {
          return {
            ...u,
            isFollowing: isNowFollowing,
            followersCount: isNowFollowing
              ? (u.followersCount || 0) + 1
              : Math.max(0, (u.followersCount || 0) - 1),
          };
        }
        return u;
      })
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <UsersIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Community Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discover and connect with developers, creators, and peers
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 max-w-sm w-full relative"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Active Search Filter Badge */}
      {urlSearch && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl mb-6 text-xs">
          <span>
            Showing search results for: <span className="font-bold">"{urlSearch}"</span>
          </span>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* User Directory Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <span className="text-sm">Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <UsersIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            {urlSearch ? `No users found matching "${urlSearch}"` : 'No users found'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {urlSearch
              ? 'Try searching with a different name or username.'
              : 'Registered users will appear here.'}
          </p>
          {urlSearch && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Users
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onFollowToggle={handleFollowToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
