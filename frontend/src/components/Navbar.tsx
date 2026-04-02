import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="text-xl font-bold dark:text-white">LOKEY-AI</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 flex items-center gap-1">
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/chat" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 flex items-center gap-1">
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Chat</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-zinc-600 dark:text-zinc-400 hover:text-red-500 flex items-center gap-1"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600">Login</Link>
              <Link to="/signup" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
