import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, Users, LogOut, TrendingUp, Sparkles } from 'lucide-react';

const Sidebar = ({ trendingTags = [], onTagClick, activeTag }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="space-y-4">
      {/* User Mini Profile Card */}
      {user && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <Link
            to={`/profile/${user._id || user.username}`}
            className="flex items-center gap-3 group"
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center border border-blue-200">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                {user.name}
              </h3>
              <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
          </Link>

          {user.bio && (
            <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 italic">
              "{user.bio}"
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-gray-100 text-center">
            <div>
              <span className="block text-xs font-bold text-slate-800">
                {user.postsCount || 0}
              </span>
              <span className="text-[11px] text-slate-500">Posts</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800">
                {user.followersCount || (user.followers ? user.followers.length : 0)}
              </span>
              <span className="text-[11px] text-slate-500">Followers</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800">
                {user.followingCount || (user.following ? user.following.length : 0)}
              </span>
              <span className="text-[11px] text-slate-500">Following</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Menu */}
      <nav className="bg-white rounded-xl border border-gray-200 p-2 shadow-xs space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/')
              ? 'bg-blue-50 text-blue-600 font-semibold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 text-blue-600" />
          <span>Home Feed</span>
        </Link>

        {user && (
          <Link
            to={`/profile/${user._id || user.username}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/profile')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5 text-slate-500" />
            <span>My Profile</span>
          </Link>
        )}

        <Link
          to="/users"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/users')
              ? 'bg-blue-50 text-blue-600 font-semibold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5 text-slate-500" />
          <span>Users Directory</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Trending Hashtags Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-sm">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Trending Tags</span>
        </div>

        {trendingTags && trendingTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map((item) => {
              const isSelected = activeTag === item.tag;
              return (
                <button
                  key={item.tag}
                  onClick={() => onTagClick && onTagClick(item.tag)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  {item.tag}{' '}
                  <span
                    className={`ml-1 text-[10px] ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    ({item.count})
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No hashtags yet. Add #tags to your post caption!
          </p>
        )}
      </div>

      {/* Internship Task 05 Badge */}
      <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 text-center text-xs text-blue-800">
        <div className="flex items-center justify-center gap-1 font-semibold text-blue-900 mb-0.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Prodigy InfoTech</span>
        </div>
        <p className="text-[11px] text-blue-700">Task 05: Social Media Platform</p>
      </div>
    </aside>
  );
};

export default Sidebar;
