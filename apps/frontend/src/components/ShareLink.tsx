import { useState } from 'react';

interface ShareLinkProps {
  sessionId: string;
}

export function ShareLink({ sessionId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <button
      onClick={handleCopyLink}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
    >
      {copied ? 'Copied!' : 'Copy Share Link'}
    </button>
  );
}
