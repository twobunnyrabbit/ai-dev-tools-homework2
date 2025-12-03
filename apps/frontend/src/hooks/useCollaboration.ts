import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseCollaborationOptions {
  socket: Socket;
  sessionId: string;
  code: string;
  language: string;
  onCodeUpdate: (code: string) => void;
  onLanguageUpdate: (language: string) => void;
  onUserJoined?: (username: string) => void;
  onUserLeft?: (username: string) => void;
}

export function useCollaboration({
  socket,
  sessionId,
  code,
  language,
  onCodeUpdate,
  onLanguageUpdate,
  onUserJoined,
  onUserLeft,
}: UseCollaborationOptions) {
  // Use ref to track the latest code without triggering re-renders
  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we're currently receiving a remote update to avoid echo
  const isRemoteUpdateRef = useRef(false);

  // Update refs when props change
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Debounced code change emission
  const emitCodeChange = useCallback(
    (newCode: string) => {
      // Don't emit if this is a remote update
      if (isRemoteUpdateRef.current) {
        return;
      }

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer to emit after 300ms
      debounceTimerRef.current = setTimeout(() => {
        if (socket.connected) {
          socket.emit('code-change', {
            sessionId,
            code: newCode,
          });
        }
      }, 300);
    },
    [socket, sessionId]
  );

  // Emit language change (no debouncing needed)
  const emitLanguageChange = useCallback(
    (newLanguage: string) => {
      if (socket.connected) {
        socket.emit('language-change', {
          sessionId,
          language: newLanguage,
        });
      }
    },
    [socket, sessionId]
  );

  useEffect(() => {
    // Listen for code updates from other users
    const handleCodeUpdate = (data: { code: string; userId: string }) => {
      // Set flag to prevent echo
      isRemoteUpdateRef.current = true;
      onCodeUpdate(data.code);
      // Reset flag after a short delay to allow local edits again
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 50);
    };

    // Listen for language updates from other users
    const handleLanguageUpdate = (data: { language: string }) => {
      onLanguageUpdate(data.language);
    };

    // Listen for user join events
    const handleUserJoined = (data: { username: string }) => {
      onUserJoined?.(data.username);
    };

    // Listen for user left events
    const handleUserLeft = (data: { username: string }) => {
      onUserLeft?.(data.username);
    };

    // Register event listeners
    socket.on('code-update', handleCodeUpdate);
    socket.on('language-update', handleLanguageUpdate);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    // Cleanup listeners on unmount
    return () => {
      socket.off('code-update', handleCodeUpdate);
      socket.off('language-update', handleLanguageUpdate);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);

      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [socket, onCodeUpdate, onLanguageUpdate, onUserJoined, onUserLeft]);

  return {
    emitCodeChange,
    emitLanguageChange,
  };
}
