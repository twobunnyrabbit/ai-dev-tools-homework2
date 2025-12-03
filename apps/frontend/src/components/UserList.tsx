import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
}

interface UserListProps {
  socket: Socket | null;
}

export function UserList({ socket }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleSessionJoined = (data: { users?: User[] }) => {
      if (data.users) {
        setUsers(data.users);
      }
    };

    const handleUserJoined = (data: { user: User; users?: User[] }) => {
      if (data.users) {
        setUsers(data.users);
      }
    };

    const handleUserLeft = (data: { userId: string; users?: User[] }) => {
      if (data.users) {
        setUsers(data.users);
      }
    };

    socket.on('session-joined', handleSessionJoined);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('session-joined', handleSessionJoined);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">
        {users.length} {users.length === 1 ? 'user' : 'users'}
      </span>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-900"
            title={user.username}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-900">
            +{users.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
