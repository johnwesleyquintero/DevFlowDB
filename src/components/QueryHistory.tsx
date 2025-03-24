import React, { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase';
import { LineChart, BarChart, PieChart } from 'recharts';
import { Calendar, Filter, ArrowUpDown, X } from 'lucide-react';

interface QueryHistoryProps {
  projectId: string;
}

export function QueryHistory({ projectId }: QueryHistoryProps) {
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    sortField: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [visualizationPrefs, setVisualizationPrefs] = useState({
    chartType: 'table',
    options: {}
  });

  const fetchVisualizationPrefs = async (queryId: string) => {
    const { data, error } = await supabase
      .from('visualization_prefs')
      .select('*')
      .eq('query_id', queryId)
      .single();

    if (data) {
      setVisualizationPrefs({
        chartType: data.chart_type,
        options: data.options
      });
    }
  };

  const [queries, setQueries] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchQueries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('query_history')
        .select('*')
        .eq('project_id', projectId)
        .order(filters.sortField, { ascending: filters.sortOrder === 'asc' })
        .ilike('status', `%${filters.status}%`)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate);

      if (error) throw error;
      setQueries(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchQueries();
}, [filters, projectId]);

  const saveVisualizationPrefs = async () => {
    if (!selectedQuery) return;

    const { error } = await supabase
      .from('visualization_prefs')
      .upsert({
        query_id: selectedQuery.id,
        chart_type: visualizationPrefs.chartType,
        options: visualizationPrefs.options
      });

    if (!error) setSelectedQuery(null);
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (isLoading) return <div>Loading query history...</div>;
  if (error) return <div>Error loading queries: {error.message}</div>;

  return (
    <div className="bg-background-dark rounded-lg shadow-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Query History</h3>
        
        <div className="flex gap-4">
          <select 
            className="bg-background-dark border border-gray-700 rounded px-3 py-2 text-white"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="success">Successful</option>
            <option value="failed">Failed</option>
          </select>

          <div className="flex items-center gap-2 border border-gray-700 rounded px-3 py-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              className="bg-background-dark text-white"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              className="bg-background-dark text-white"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              {['Query', 'Status', 'Duration', 'Date', 'Actions'].map((header) => (
                <th 
                  key={header}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer"
                  onClick={() => header === 'Date' && handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {header === 'Date' && (
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {queries.map((query) => (
              <tr key={query.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                  {query.query_text}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    query.status === 'success' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {query.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {query.execution_time_ms}ms
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(query.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  <button 
                    onClick={() => {
                      setSelectedQuery(query);
                      fetchVisualizationPrefs(query.id);
                    }}
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    Visualize
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visualization Preferences Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-background-dark p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Visualization Settings</h3>
              <button 
                onClick={() => setSelectedQuery(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Chart Type</label>
                <select
                  value={visualizationPrefs.chartType}
                  onChange={(e) => setVisualizationPrefs(prev => ({
                    ...prev,
                    chartType: e.target.value
                  }))}
                  className="w-full bg-background border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="table">Table</option>
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              <button
                onClick={saveVisualizationPrefs}
                className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}