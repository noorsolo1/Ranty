export default function TranscriptPreview({ transcript, interimTranscript, isRecording }) {
  const hasContent = transcript || interimTranscript;

  if (!hasContent && !isRecording) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Live Transcript
        </span>
        {isRecording && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">Recording</span>
          </span>
        )}
      </div>

      <div className="min-h-[80px] text-gray-200 leading-relaxed">
        <span>{transcript}</span>
        {interimTranscript && (
          <span className="text-gray-400 italic">{interimTranscript}</span>
        )}
        {isRecording && !hasContent && (
          <span className="text-gray-500 italic">Listening... start speaking</span>
        )}
      </div>

      {transcript && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
          {transcript.trim().split(/\s+/).filter(Boolean).length} words
        </div>
      )}
    </div>
  );
}
