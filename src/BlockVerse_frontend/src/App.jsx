import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthGuard from './components/auth/AuthGuard';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Feed from './components/feed/Feed';
import ProfilePage from './components/profile/ProfilePage';
import PostDetails from './components/feed/PostDetails';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <div className="app-body">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <AuthGuard>
                        <Feed />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <AuthGuard>
                        <ProfilePage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/post/:postId"
                    element={
                      <AuthGuard>
                        <PostDetails />
                      </AuthGuard>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;