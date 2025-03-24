import React from 'react';
import { Link } from 'react-router-dom';
import { Database, KeyRound, Home, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-background-dark border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl text-white">DevFlowDB</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/" className="flex items-center space-x-1 text-gray-300 hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/projects" className="flex items-center space-x-1 text-gray-300 hover:text-primary transition-colors">
                <Database className="w-4 h-4" />
                <span>Projects</span>
              </Link>
              <Link to="/api-keys" className="flex items-center space-x-1 text-gray-300 hover:text-primary transition-colors">
                <KeyRound className="w-4 h-4" />
                <span>API Keys</span>
              </Link>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-1 text-gray-300 hover:text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}