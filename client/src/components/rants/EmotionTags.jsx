const EMOTION_COLORS = {
  angry: 'bg-red-900/60 text-red-300 border-red-700',
  anxious: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  sad: 'bg-blue-900/60 text-blue-300 border-blue-700',
  frustrated: 'bg-orange-900/60 text-orange-300 border-orange-700',
  overwhelmed: 'bg-purple-900/60 text-purple-300 border-purple-700',
  scared: 'bg-pink-900/60 text-pink-300 border-pink-700',
  lonely: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
  ashamed: 'bg-rose-900/60 text-rose-300 border-rose-700',
  discouraged: 'bg-gray-700/60 text-gray-300 border-gray-600',
  hopeful: 'bg-green-900/60 text-green-300 border-green-700',
};

export default function EmotionTags({ emotions, size = 'sm' }) {
  if (!emotions || emotions.length === 0) return null;

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <div className="flex flex-wrap gap-1.5">
      {emotions.map((emotion) => (
        <span
          key={emotion}
          className={`${padding} rounded-full border font-medium ${
            EMOTION_COLORS[emotion] || 'bg-gray-800 text-gray-300 border-gray-700'
          }`}
        >
          {emotion}
        </span>
      ))}
    </div>
  );
}
