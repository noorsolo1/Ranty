import { Link } from 'react-router-dom';
import EmotionTags from './EmotionTags';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getSentimentColor(score) {
  if (score === null || score === undefined) return 'bg-gray-700';
  if (score < -0.6) return 'bg-red-700';
  if (score < -0.3) return 'bg-orange-700';
  if (score < 0) return 'bg-yellow-700';
  if (score < 0.3) return 'bg-blue-700';
  return 'bg-green-700';
}

export default function RantCard({ rant }) {
  return (
    <Link to={`/rants/${rant.id}`} className="block group">
      <div className="card hover:border-gray-600 hover:bg-gray-800/80 transition-all group-hover:shadow-lg group-hover:shadow-black/30">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-100 truncate group-hover:text-white">
              {rant.title || rant.transcript.slice(0, 60)}
              {!rant.title && rant.transcript.length > 60 ? '...' : ''}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(rant.recorded_at)}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {rant.sentiment_score !== null && rant.sentiment_score !== undefined && (
              <div
                className={`w-2 h-2 rounded-full ${getSentimentColor(rant.sentiment_score)}`}
                title={`Sentiment: ${rant.sentiment_score.toFixed(2)}`}
              />
            )}
            {rant.audio_filename && (
              <span className="text-gray-500" title="Has audio">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
                  <path d="M19 10h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0z" />
                </svg>
              </span>
            )}
            {rant.duration_sec && (
              <span className="text-xs text-gray-500">
                {Math.floor(rant.duration_sec / 60)}:{String(rant.duration_sec % 60).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {rant.transcript}
        </p>

        {rant.emotions && <EmotionTags emotions={rant.emotions} />}

        {!rant.emotions && (
          <span className="text-xs text-gray-600 italic">Analysis pending...</span>
        )}
      </div>
    </Link>
  );
}
