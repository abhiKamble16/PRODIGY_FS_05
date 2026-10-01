import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, UserPlus, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, username, email, password, confirmPassword } = formData;

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join SocialApp — Prodigy InfoTech Task 05
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Abhi Kamble"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="e.g. abhi16"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. abhi@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
