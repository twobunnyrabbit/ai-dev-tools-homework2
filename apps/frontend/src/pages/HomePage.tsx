import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../lib/api';
import type { Language } from '../types/session';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'cpp', label: 'C++' },
];

export function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await createSession({ language: selectedLanguage });
      navigate(`/session/${response.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            CodeCollab
          </h1>
          <p className="text-slate-300">
            Collaborative coding interviews made easy
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Select Language
            </label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isCreating}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-slate-800">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateSession}
            disabled={isCreating}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {isCreating ? 'Creating Session...' : 'Create Session'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-slate-300">
          <p>
            Start a new coding session and share the link with your interviewer
          </p>
        </div>
      </div>
    </div>
  );
}
