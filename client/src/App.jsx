import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Users from './pages/Users';
import CreatePostBox from './components/CreatePostBox';
import { X } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Layout
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [isGlobalCreateModalOpen, setIsGlobalCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenCreatePost={isAuthenticated ? () => setIsGlobalCreateModalOpen(true) : null} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Quick Create Post Modal */}
      {isGlobalCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-slate-900">Create a New Post</h2>
              <button
                onClick={() => setIsGlobalCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CreatePostBox
              onPostCreated={() => {
                setIsGlobalCreateModalOpen(false);
                // If on another page, navigate to home to view it
                if (window.location.pathname !== '/') {
                  window.location.href = '/';
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-medium text-slate-700">
            Prodigy InfoTech Internship — Web Development Task 05
          </p>
          <p className="text-slate-400 mt-1">
            Social Media Platform built with MongoDB, Express.js, React.js, Node.js, and Cloudinary.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
