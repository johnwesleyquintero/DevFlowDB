import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';
import { Database, KeyRound, AlertCircle } from 'lucide-react';
import { QueryHistory } from './components/QueryHistory';

function Dashboard() {
  const [stats, setStats] = useState({
    projectCount: 0,
    queryCount: 0,
    apiKeyCount: 0
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const [
        projectsResponse,
        queriesResponse,
        apiKeysResponse
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('queries').select('*', { count: 'exact' }),
        supabase.from('api_keys').select('*', { count: 'exact' })
      ]);

      const projectCount = projectsResponse.count;
      const queryCount = queriesResponse.count;
      const apiKeyCount = apiKeysResponse.count;

      if (projectsResponse.data?.length) {
        setSelectedProjectId(projectsResponse.data[0].id);
      }

      setStats({ projectCount, queryCount, apiKeyCount });
    }

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-dark rounded-lg shadow-lg border border-gray-800 p-6 hover:border-primary transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-2xl font-semibold text-white">{stats.projectCount}</p>
            </div>
            <Database className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-background-dark rounded-lg shadow-lg border border-gray-800 p-6 hover:border-secondary transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Queries Executed</p>
              <p className="text-2xl font-semibold text-white">{stats.queryCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="bg-background-dark rounded-lg shadow-lg border border-gray-800 p-6 hover:border-primary transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active API Keys</p>
              <p className="text-2xl font-semibold text-white">{stats.apiKeyCount}</p>
            </div>
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>
      
      {selectedProjectId && (
        <div className="mt-8">
          <QueryHistory projectId={selectedProjectId} />
        </div>
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-background rounded-lg shadow-xl border border-gray-800">
          <div className="text-center">
            <Database className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-white">DevFlowDB</h2>
            <p className="mt-2 text-sm text-gray-400">Sign in to access your database projects</p>
          </div>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-brand hover:opacity-90 transition-opacity"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<div>Projects Management (Coming Soon)</div>} />
          <Route path="/api-keys" element={<div>API Keys Management (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;