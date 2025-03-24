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
  const [error, setError] = useState<string | null>(null);

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

      // Save query history
      await supabase.from('queries').insert({
        project_id: projectId,
        sql_query: query,
        execution_time_ms: executionTime
      });

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                <span>Run Query</span>
              </button>
              <button
                onClick={() => {}} // TODO: Implement save query
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
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