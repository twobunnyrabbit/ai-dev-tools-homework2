import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getSessionCode } from '../lib/api';
import type { Session, Language } from '../types/session';
import { CodeEditor } from '../components/CodeEditor';
import { LanguageSelector } from '../components/LanguageSelector';
import { ShareLink } from '../components/ShareLink';
import { UserList } from '../components/UserList';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { OutputPanel } from '../components/OutputPanel';
import { RunButton } from '../components/RunButton';
import { useSocket } from '../hooks/useSocket';
import { useCollaboration } from '../hooks/useCollaboration';
import { useCodeExecution } from '../hooks/useCodeExecution';

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [username, setUsername] = useState<string>('');
  const [showUsernameDialog, setShowUsernameDialog] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');

  // Socket connection management
  const { socket, status } = useSocket();

  // Collaboration hooks
  const { emitCodeChange, emitLanguageChange } = useCollaboration({
    socket,
    sessionId: sessionId || '',
    code,
    language,
    onCodeUpdate: setCode,
    onLanguageUpdate: setLanguage,
  });

  // Code execution hook
  const { executeCode, clearResult, result, isExecuting } = useCodeExecution();

  // Fetch session data on mount
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

  // Connect to socket and join session when username is set
  useEffect(() => {
    if (!sessionId || !username) return;

    // Connect socket
    socket.connect();

    // Join session
    socket.emit('join-session', {
      sessionId,
      username,
    });

    // Handle session-joined event
    const handleSessionJoined = (data: { users: string[] }) => {
      console.log('Joined session with users:', data.users);
    };

    // Handle error event
    const handleError = (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    };

    socket.on('session-joined', handleSessionJoined);
    socket.on('error', handleError);

    // Cleanup on unmount
    return () => {
      socket.emit('leave-session', { sessionId });
      socket.disconnect();
      socket.off('session-joined', handleSessionJoined);
      socket.off('error', handleError);
    };
  }, [sessionId, username, socket]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    emitCodeChange(newCode);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    emitLanguageChange(newLanguage);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
      setShowUsernameDialog(false);
    }
  };

  const handleRunCode = () => {
    executeCode(code, language);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col">
        <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-36 md:w-48 bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              <div className="h-8 w-28 md:w-32 bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-20 md:w-24 bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 md:p-6 flex items-center justify-center">
          <div className="text-white text-lg md:text-xl">Loading session...</div>
        </main>
      </div>
    );
  }

  if (error || !session) {
    return null; // Will be redirected to not found page
  }

  return (
    <>
      {/* Username Dialog */}
      {showUsernameDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Enter Your Name</h2>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <button
                type="submit"
                disabled={!usernameInput.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                Join Session
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`h-screen bg-slate-900 flex flex-col ${showUsernameDialog ? 'blur-sm' : ''}`}>
      {/* Reconnecting Banner */}
      {status === 'reconnecting' && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium">
          Connection lost. Attempting to reconnect...
        </div>
      )}
      {status === 'disconnected' && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
          Disconnected. Please refresh the page to reconnect.
        </div>
      )}

      <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <h1 className="text-lg md:text-xl font-bold text-white">CodeCollab</h1>
            <ShareLink sessionId={sessionId!} />
          </div>

          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <LanguageSelector value={language} onChange={handleLanguageChange} />
            <RunButton onRun={handleRunCode} isExecuting={isExecuting} language={language} />
            <UserList socket={socket} />
            <ConnectionStatus status={status} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col">
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              language={language}
              onChange={handleCodeChange}
              disabled={status !== 'connected'}
              onRun={handleRunCode}
            />
          </div>
          <OutputPanel result={result} isExecuting={isExecuting} onClear={clearResult} />
        </div>
      </main>
      </div>
    </>
  );
}
