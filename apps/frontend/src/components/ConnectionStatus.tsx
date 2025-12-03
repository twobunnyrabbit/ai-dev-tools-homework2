interface ConnectionStatusProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      textColor: 'text-green-500',
    },
    reconnecting: {
      color: 'bg-yellow-500',
      text: 'Reconnecting',
      textColor: 'text-yellow-500',
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      textColor: 'text-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className={`text-sm ${config.textColor}`}>{config.text}</span>
    </div>
  );
}
