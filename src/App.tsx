import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateForum from './pages/CreateForum';
import ForumDetail from './pages/ForumDetail';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <div className="circle-container">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create" element={<CreateForum />} />
              <Route path="/forum/:id" element={<ForumDetail />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
