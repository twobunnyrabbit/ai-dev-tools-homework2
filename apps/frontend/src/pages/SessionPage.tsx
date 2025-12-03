import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession } from '../lib/api';
import type { Session } from '../types/session';

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const fetchSession = async () => {
      try {
        const sessionData = await getSession(sessionId);
        if (!sessionData.exists) {
          navigate('/session-not-found');
          return;
        }
        setSession(sessionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
        navigate('/session-not-found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, navigate]);

  const handleCopyLink = async () => {
    if (!sessionId) return;

    const link = `${window.location.origin}/session/${sessionId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return null; // Will be redirected to not found page
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">CodeCollab</h1>
            <div className="text-sm text-slate-400">
              Language: <span className="text-white font-medium">{session.language}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Users: <span className="text-white font-medium">{session.userCount}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {copied ? 'Copied!' : 'Copy Share Link'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="h-full bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
          <div className="text-slate-400 text-lg">
            Editor will be integrated in Phase 3
          </div>
        </div>
      </main>
    </div>
  );
}
