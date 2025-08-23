import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Feed from './components/feed/Feed';
import ProfilePage from './components/profile/ProfilePage';
import PostDetails from './components/feed/PostDetails';
import AuthGuard from './components/auth/AuthGuard';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            BlockVerse
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            The first fully on-chain social media platform. Own your data, connect globally, and earn while you share.
          </p>
          <AuthGuard>
            <div className="text-gray-400">Connecting to Internet Identity...</div>
          </AuthGuard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;