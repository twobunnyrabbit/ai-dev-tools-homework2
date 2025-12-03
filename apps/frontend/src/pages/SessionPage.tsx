import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getSessionCode } from '../lib/api';
import type { Session, Language } from '../types/session';
import { CodeEditor } from '../components/CodeEditor';
import { LanguageSelector } from '../components/LanguageSelector';
import { ShareLink } from '../components/ShareLink';

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<Language>('javascript');

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
        setLanguage(sessionData.language);

        // Fetch initial code content
        const codeData = await getSessionCode(sessionId);
        setCode(codeData.code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
        navigate('/session-not-found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, navigate]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // TODO: In Phase 4, emit socket event for code-change
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // TODO: In Phase 4, emit socket event for language-change
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
    <div className="h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">CodeCollab</h1>
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Users: <span className="text-white font-medium">{session.userCount}</span>
            </div>
            <ShareLink sessionId={sessionId!} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <CodeEditor value={code} language={language} onChange={handleCodeChange} />
        </div>
      </main>
    </div>
  );
}
