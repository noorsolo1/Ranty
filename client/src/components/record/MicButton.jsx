export default function MicButton({ isRecording, onClick, disabled }) {
  return (
    <div className="relative flex items-center justify-center w-72 h-72">
      {/* Outer slower ring (only while recording) */}
      {isRecording && (
        <span className="absolute w-72 h-72 rounded-full bg-red-600 opacity-20 animate-ping-slower" />
      )}
      {/* Outer fast ring (only while recording) */}
      {isRecording && (
        <span className="absolute w-64 h-64 rounded-full bg-red-600 opacity-30 animate-ping-slow" />
      )}

      {/* Main button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 w-56 h-56 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-gray-950 shadow-2xl ${
          isRecording
            ? 'bg-red-600 hover:bg-red-500 shadow-red-900/60 scale-105'
            : 'bg-red-700 hover:bg-red-600 shadow-red-950/40'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex flex-col items-center gap-2">
          {isRecording ? (
            <>
              {/* Stop icon */}
              <div className="w-10 h-10 bg-white rounded-lg opacity-90" />
              <span className="text-white font-semibold text-sm tracking-wide">STOP</span>
            </>
          ) : (
            <>
              {/* Mic icon */}
              <svg
                className="w-16 h-16 text-white opacity-90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 14a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 3v2h-3v2h8v-2h-3v-2h-2z" />
              </svg>
              <span className="text-white font-semibold text-sm tracking-wide">TAP TO RANT</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}
