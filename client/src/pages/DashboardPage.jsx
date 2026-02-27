import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import EmotionChart from '../components/dashboard/EmotionChart';
import TriggerCloud from '../components/dashboard/TriggerCloud';
import TimeHeatmap from '../components/dashboard/TimeHeatmap';
import AiInsightCard from '../components/dashboard/AiInsightCard';

export default function DashboardPage() {
  const [emotions, setEmotions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [summaryData, setSummaryData] = useState({ summary: null, generated_at: null, cached: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [emotRes, kwRes, hmRes, sumRes] = await Promise.all([
          apiClient.get('/analysis/emotions'),
          apiClient.get('/analysis/keywords'),
          apiClient.get('/analysis/heatmap'),
          apiClient.get('/analysis/summary').catch(() => ({ data: { summary: null } })),
        ]);
        setEmotions(emotRes.data);
        setKeywords(kwRes.data);
        setHeatmap(hmRes.data);
        setSummaryData(sumRes.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  function handleSummaryRefresh(summary, generated_at) {
    setSummaryData({ summary, generated_at, cached: false });
  }

  const totalRants = emotions.reduce((sum, e) => sum + e.count, 0);
  const topEmotion = emotions[0]?.emotion || '—';
  const avgSentiment = null; // computed server-side

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your emotional patterns over time</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-white">{emotions.reduce((s, e) => s + e.count, 0)}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Total Rants</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-400 capitalize">{topEmotion}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Top Emotion</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-white">{keywords.length}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Unique Triggers</p>
        </div>
      </div>

      {/* Emotion Chart */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Emotion Frequency</h2>
        <EmotionChart data={emotions} />
      </div>

      {/* Heatmap */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Rant Time Heatmap (Hour of Day)</h2>
        <TimeHeatmap data={heatmap} />
      </div>

      {/* Trigger Cloud */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Trigger Word Cloud</h2>
        <TriggerCloud data={keywords} />
      </div>

      {/* AI Summary */}
      <AiInsightCard
        summary={summaryData.summary}
        generatedAt={summaryData.generated_at}
        cached={summaryData.cached}
        onRefresh={handleSummaryRefresh}
      />
    </div>
  );
}
