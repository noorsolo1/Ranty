import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import EmotionTags from '../components/rants/EmotionTags';
import AudioPlayer from '../components/rants/AudioPlayer';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function SentimentBar({ score }) {
  if (score === null || score === undefined) return null;
  const pct = ((score + 1) / 2) * 100; // map -1..1 to 0..100
  const color = score < -0.5 ? 'bg-red-500' : score < 0 ? 'bg-orange-500' : score < 0.3 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Very Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">
        Score: {score.toFixed(2)}
      </p>
    </div>
  );
}

export default function RantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rant, setRant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    let poll;

    const startPoll = () => {
      poll = setInterval(async () => {
        try {
          const res = await apiClient.get(`/rants/${id}`);
          if (res.data.emotions) {
            setRant(res.data);
            clearInterval(poll);
          }
        } catch {
          clearInterval(poll);
        }
      }, 3000);
    };

    fetchRant().then((r) => {
      if (r && !r.emotions) startPoll();
    });

    return () => clearInterval(poll);
  }, [id]);

  async function fetchRant() {
    setLoading(true);
    try {
      const res = await apiClient.get(`/rants/${id}`);
      setRant(res.data);
      return res.data;
    } catch {
      setError('Rant not found or you don\'t have access.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this rant permanently?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/rants/${id}`);
      navigate('/rants');
    } catch {
      setError('Failed to delete rant.');
      setDeleting(false);
    }
  }

  async function handleReanalyze() {
    setReanalyzing(true);
    try {
      const res = await apiClient.post(`/rants/${id}/analyze`);
      setRant(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setReanalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !rant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-400 mb-4">{error || 'Rant not found.'}</p>
        <Link to="/rants" className="btn-secondary">Back to Rant Log</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/rants" className="text-sm text-gray-400 hover:text-gray-300 mb-2 inline-block">
            ← Back to Rant Log
          </Link>
          <h1 className="text-xl font-bold text-white">
            {rant.title || rant.transcript.slice(0, 60) + '...'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(rant.recorded_at)}</p>
          {rant.duration_sec && (
            <p className="text-xs text-gray-500 mt-0.5">
              Duration: {Math.floor(rant.duration_sec / 60)}:{String(rant.duration_sec % 60).padStart(2, '0')}
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-800"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Audio Player */}
      {rant.audio_filename ? (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Audio Recording</h2>
          <AudioPlayer rantId={rant.id} />
        </div>
      ) : (
        <div className="card text-sm text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          No audio recording for this rant
        </div>
      )}

      {/* Transcript */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Full Transcript</h2>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{rant.transcript}</p>
        <p className="text-xs text-gray-600 mt-3">
          {rant.transcript.trim().split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      {/* AI Analysis */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">AI Analysis</h2>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
          >
            {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
          </button>
        </div>

        {rant.emotions ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Detected Emotions</p>
              <EmotionTags emotions={rant.emotions} size="md" />
            </div>

            {rant.trigger_keywords && rant.trigger_keywords.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Trigger Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {rant.trigger_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm border border-gray-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rant.sentiment_score !== null && rant.sentiment_score !== undefined && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Sentiment</p>
                <SentimentBar score={rant.sentiment_score} />
              </div>
            )}

            {rant.ai_summary && (
              <div>
                <p className="text-xs text-gray-500 mb-2">AI Insight</p>
                <div className="border-l-2 border-red-700 pl-4 text-gray-300 text-sm leading-relaxed">
                  {rant.ai_summary}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin flex-shrink-0" />
            <span>Analysis in progress... this usually takes a few seconds.</span>
          </div>
        )}
      </div>
    </div>
  );
}
