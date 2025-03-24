import React, { useState } from 'react';
import Editor from "@monaco-editor/react";
import { Play, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QueryEditorProps {
  projectId: string;
}

export function QueryEditor({ projectId }: QueryEditorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const startTime = performance.now();
      const { data, error: queryError } = await supabase.rpc('execute_query', {
        query_text: query,
        project_id: projectId
      });
      const executionTime = Math.round(performance.now() - startTime);

      if (queryError) throw queryError;

      // Save query history with user context and status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error: historyError } = await supabase.from('query_history').insert({
        user_id: user.id,
        project_id: projectId,
        query_text: query,
        execution_time_ms: executionTime,
        status: queryError ? 'failed' : 'success',
        error_message: queryError?.message || null,
        results: data
      });

      if (historyError) throw historyError;

      setResults(data);
    } catch (err) {
      setError(`Execution error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">SQL Query Editor</h2>
            <div className="flex space-x-2">
              <button
                onClick={executeQuery}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {loading ? <span className="animate-pulse">Running...</span> : <span>Run Query</span>}
              </button>
              <button
                onClick={() => setIsSaveDialogOpen(true)}
                className="flex items-center space-x-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <Save className="w-4 h-4" />
                <span>Save Query</span>
              </button>
            </div>
          </div>
        </div>
        <Editor
          height="200px"
          language="sql"
          theme="vs-dark"
          value={query}
          onChange={(value) => setQuery(value || '')}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
          {error}
        </div>
      )}

      {/* Save Query Dialog */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg space-y-4 w-96">
            <h3 className="text-lg font-semibold">Save Query</h3>
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              placeholder="Query name"
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                    setIsSaving(true);
                    setError(null);
                  try {
                    await supabase.from('saved_queries').insert({
                      project_id: projectId,
                      name: queryName,
                      query: query,
                      created_at: new Date().toISOString(),
                    });
                    setIsSaveDialogOpen(false);
                    setQueryName('');
                    setIsSaving(false);
                  } catch (err) {
                    setError(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(results[0] || {}).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((value: any, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {JSON.stringify(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}