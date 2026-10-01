import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, LogIn, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (userNum) => {
    if (userNum === 1) {
      setIdentifier('abhi16');
      setPassword('password123');
    } else {
      setIdentifier('rohit_dev');
      setPassword('password123');
    }
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to SocialApp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prodigy InfoTech Internship — Task 05
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              required
              placeholder="e.g. abhi16 or abhi@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons (For quick internship testing) */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Demo Accounts for Evaluation
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials(1)}
              className="py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs rounded-lg transition-colors cursor-pointer text-center"
            >
              Demo User 1 (@abhi16)
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials(2)}
              className="py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs rounded-lg transition-colors cursor-pointer text-center"
            >
              Demo User 2 (@rohit_dev)
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
