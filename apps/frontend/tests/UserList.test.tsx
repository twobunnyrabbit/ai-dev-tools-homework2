import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserList } from '../src/components/UserList';
import { Socket } from 'socket.io-client';

// Mock Socket.io client
const createMockSocket = () => {
  const listeners: Record<string, Function[]> = {};

  return {
    on: vi.fn((event: string, handler: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    }),
    off: vi.fn((event: string, handler: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    }),
    emit: vi.fn((event: string, ...args: any[]) => {
      if (listeners[event]) {
        listeners[event].forEach(handler => handler(...args));
      }
    }),
    _trigger: (event: string, data: any) => {
      if (listeners[event]) {
        listeners[event].forEach(handler => handler(data));
      }
    },
  } as any as Socket;
};

describe('UserList', () => {
  it('should render with no users initially', () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    expect(screen.getByText('0 users')).toBeInTheDocument();
  });

  it('should display users after session-joined event', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    const users = [
      { id: '1', username: 'Alice' },
      { id: '2', username: 'Bob' },
    ];

    act(() => {
      mockSocket._trigger('session-joined', { users });
    });

    await waitFor(() => {
      expect(screen.getByText('2 users')).toBeInTheDocument();
    });
    expect(screen.getByTitle('Alice')).toBeInTheDocument();
    expect(screen.getByTitle('Bob')).toBeInTheDocument();
  });

  it('should update users when user-joined event fires', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    const initialUsers = [{ id: '1', username: 'Alice' }];

    act(() => {
      mockSocket._trigger('session-joined', { users: initialUsers });
    });

    await waitFor(() => {
      expect(screen.getByText('1 user')).toBeInTheDocument();
    });

    const updatedUsers = [
      { id: '1', username: 'Alice' },
      { id: '2', username: 'Bob' },
    ];

    act(() => {
      mockSocket._trigger('user-joined', { user: updatedUsers[1], users: updatedUsers });
    });

    await waitFor(() => {
      expect(screen.getByText('2 users')).toBeInTheDocument();
    });
  });

  it('should update users when user-left event fires', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    const users = [
      { id: '1', username: 'Alice' },
      { id: '2', username: 'Bob' },
    ];

    act(() => {
      mockSocket._trigger('session-joined', { users });
    });

    await waitFor(() => {
      expect(screen.getByText('2 users')).toBeInTheDocument();
    });

    act(() => {
      mockSocket._trigger('user-left', { userId: '2', users: [users[0]] });
    });

    await waitFor(() => {
      expect(screen.getByText('1 user')).toBeInTheDocument();
    });
    expect(screen.getByTitle('Alice')).toBeInTheDocument();
    expect(screen.queryByTitle('Bob')).not.toBeInTheDocument();
  });

  it('should display correct singular/plural user text', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    act(() => {
      mockSocket._trigger('session-joined', { users: [] });
    });
    expect(screen.getByText('0 users')).toBeInTheDocument();

    act(() => {
      mockSocket._trigger('session-joined', { users: [{ id: '1', username: 'Alice' }] });
    });

    await waitFor(() => {
      expect(screen.getByText('1 user')).toBeInTheDocument();
    });

    act(() => {
      mockSocket._trigger('session-joined', {
        users: [
          { id: '1', username: 'Alice' },
          { id: '2', username: 'Bob' },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByText('2 users')).toBeInTheDocument();
    });
  });

  it('should display first letter of usernames in avatars', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    const users = [
      { id: '1', username: 'Alice' },
      { id: '2', username: 'Bob' },
    ];

    act(() => {
      mockSocket._trigger('session-joined', { users });
    });

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  it('should show only first 5 users with overflow indicator', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    const users = Array.from({ length: 7 }, (_, i) => ({
      id: `${i + 1}`,
      username: `User${i + 1}`,
    }));

    act(() => {
      mockSocket._trigger('session-joined', { users });
    });

    await waitFor(() => {
      expect(screen.getByText('7 users')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });

  it('should not show overflow indicator with 5 or fewer users', async () => {
    const mockSocket = createMockSocket();
    render(<UserList socket={mockSocket} />);

    const users = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      username: `User${i + 1}`,
    }));

    act(() => {
      mockSocket._trigger('session-joined', { users });
    });

    await waitFor(() => {
      expect(screen.getByText('5 users')).toBeInTheDocument();
    });
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('should cleanup event listeners on unmount', () => {
    const mockSocket = createMockSocket();
    const { unmount } = render(<UserList socket={mockSocket} />);

    expect(mockSocket.on).toHaveBeenCalledWith('session-joined', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('user-joined', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('user-left', expect.any(Function));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('session-joined', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('user-joined', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('user-left', expect.any(Function));
  });

  it('should not crash when socket is null', () => {
    render(<UserList socket={null} />);
    expect(screen.getByText('0 users')).toBeInTheDocument();
  });
});
