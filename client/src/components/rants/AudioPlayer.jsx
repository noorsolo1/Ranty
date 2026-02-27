import { useRef, useState } from 'react';

export default function AudioPlayer({ rantId }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const audioSrc = `/api/rants/${rantId}/audio`;

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!loaded) {
      audio.load();
      setLoaded(true);
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch((e) => console.error('Play error:', e));
      setPlaying(true);
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration || 0);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }

  function handleSeek(e) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio * 100);
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="none"
      />

      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {playing ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <div
          className="h-2 bg-gray-700 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-2 bg-red-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <span className="text-xs text-gray-400 font-mono flex-shrink-0">
        {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
      </span>
    </div>
  );
}
