import type { Language } from '../types/session';

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
}

const languages: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'cpp', label: 'C++' },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as Language);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm text-slate-400">
        Language:
      </label>
      <select
        id="language-select"
        value={value}
        onChange={handleChange}
        className="bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
