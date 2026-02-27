import { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MicButton from '../components/record/MicButton';
import TranscriptPreview from '../components/record/TranscriptPreview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import apiClient from '../api/client';

const initialState = {
  phase: 'idle',   // idle | recording | saving
  error: null,
  startTime: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'recording', error: null, startTime: Date.now() };
    case 'STOP':
      return { ...state, phase: 'saving' };
    case 'DONE':
      return { ...state, phase: 'idle' };
    case 'ERROR':
      return { ...state, phase: 'idle', error: action.error };
    default:
      return state;
  }
}

function RecordingTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return <span>{m}:{String(s).padStart(2, '0')} elapsed</span>;
}

export default function RecordPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [savedTranscript, setSavedTranscript] = useState('');

  const {
    transcript, interimTranscript, isSupported,
    startListening, stopListening,
  } = useSpeechRecognition();

  const {
    isRecording: isMicRecording, audioBlob, error: micError,
    startRecording, stopRecording,
  } = useMediaRecorder();

  // Handle mic error
  useEffect(() => {
    if (micError && state.phase === 'recording') {
      dispatch({ type: 'ERROR', error: micError });
    }
  }, [micError, state.phase]);

  // When audioBlob is available and we're in saving phase, save the rant
  useEffect(() => {
    if (state.phase === 'saving' && audioBlob !== null) {
      doSaveRant(savedTranscript, audioBlob);
    }
  }, [audioBlob, state.phase]);

  // Fallback: if saving but no audio blob appears within 2s (audio not supported), save text only
  useEffect(() => {
    if (state.phase !== 'saving') return;
    const timer = setTimeout(() => {
      if (state.phase === 'saving' && audioBlob === null) {
        doSaveRant(savedTranscript, null);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.phase]);

  async function doSaveRant(finalTranscript, blob) {
    if (!finalTranscript.trim()) {
      dispatch({ type: 'ERROR', error: 'No speech detected. Try again.' });
      return;
    }

    const durationSec = state.startTime
      ? Math.round((Date.now() - state.startTime) / 1000)
      : null;

    const formData = new FormData();
    formData.append('transcript', finalTranscript.trim());
    if (durationSec) formData.append('duration_sec', durationSec);
    if (blob) formData.append('audio', blob, 'rant.webm');

    try {
      const res = await apiClient.post('/rants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch({ type: 'DONE' });
      navigate(`/rants/${res.data.id}`);
    } catch (err) {
      dispatch({ type: 'ERROR', error: err.response?.data?.error || 'Failed to save rant.' });
    }
  }

  function handleMicClick() {
    if (state.phase === 'idle') {
      dispatch({ type: 'START' });
      startListening();
      startRecording();
    } else if (state.phase === 'recording') {
      const finalTranscript = stopListening();
      stopRecording();
      setSavedTranscript(finalTranscript || transcript);
      dispatch({ type: 'STOP' });
    }
  }

  const isRecording = state.phase === 'recording';
  const isSaving = state.phase === 'saving';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {!isSupported && (
        <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 rounded-lg px-4 py-3 mb-6 text-sm">
          <strong>Note:</strong> Live transcription is not supported in your browser (Firefox).
          Audio will still be recorded. Try Chrome or Edge for full features.
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {isSaving ? 'Saving your rant...' : isRecording ? 'Ranting...' : 'Ready to rant?'}
        </h1>
        <p className="text-gray-400 text-sm">
          {isSaving
            ? 'Uploading and triggering AI analysis'
            : isRecording
            ? 'Say everything on your mind. Tap the button when done.'
            : "Tap the mic and say exactly what's bothering you."}
        </p>
      </div>

      {state.error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">
          {state.error}
        </div>
      )}

      <div className="flex justify-center">
        {isSaving ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Saving rant...</p>
          </div>
        ) : (
          <MicButton
            isRecording={isRecording}
            onClick={handleMicClick}
            disabled={isSaving}
          />
        )}
      </div>

      <TranscriptPreview
        transcript={transcript}
        interimTranscript={interimTranscript}
        isRecording={isRecording}
      />

      {isRecording && state.startTime && (
        <div className="text-center mt-6 text-sm text-gray-500">
          <RecordingTimer startTime={state.startTime} />
        </div>
      )}
    </div>
  );
}
