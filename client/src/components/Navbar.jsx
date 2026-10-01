import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Home,
  Users,
  User,
  LogOut,
  Search,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

const Navbar = ({ onOpenCreatePost }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/users?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo / App Name */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Social<span className="text-blue-600">App</span>
            </span>
          </Link>

          {/* Search bar (Center) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md relative"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users by name or @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 text-slate-800 placeholder-gray-400 rounded-full border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </form>

          {/* Navigation links & User Actions */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                to="/users"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/users')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </Link>

              <Link
                to={`/profile/${user?._id || user?.username}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/profile')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>

              {onOpenCreatePost && (
                <button
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 ml-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create</span>
                </button>
              )}

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200 ml-2">
                <Link
                  to={`/profile/${user?._id || user?.username}`}
                  className="flex items-center gap-2 text-left group"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center border border-blue-200">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 max-w-[100px] truncate">
                    {user?.name || user?.username}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-lg border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </form>

          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Home className="w-4 h-4" />
                <span>Home Feed</span>
              </Link>
              <Link
                to="/users"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Users className="w-4 h-4" />
                <span>Users Directory</span>
              </Link>
              <Link
                to={`/profile/${user?._id || user?.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="w-4 h-4" />
                <span>My Profile (@{user?.username})</span>
              </Link>
              {onOpenCreatePost && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCreatePost();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Post</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
