import { useState } from 'react';
import apiClient from '../../api/client';

export default function AiInsightCard({ summary, generatedAt, cached, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await apiClient.post('/analysis/summary/refresh');
      onRefresh(res.data.summary, res.data.generated_at);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }

  function formatDate(str) {
    if (!str) return '';
    return new Date(str).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">AI Pattern Analysis</h3>
          {generatedAt && (
            <p className="text-xs text-gray-500 mt-0.5">
              {cached ? 'Cached' : 'Generated'} {formatDate(generatedAt)}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        >
          {refreshing ? (
            <>
              <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {summary ? (
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line border-l-2 border-red-700 pl-4">
          {summary}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">
          Click Refresh to generate your AI pattern analysis. Requires at least a few recorded rants.
        </div>
      )}
    </div>
  );
}
