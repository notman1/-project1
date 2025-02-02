import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 bg-white/10 backdrop-blur-md shadow-lg z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Nerd Forums</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white">Welcome, {profile?.username}</span>
                {profile?.is_admin && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-purple-200 transition"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth?mode=login')}
                  className="flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth?mode=signup')}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar
