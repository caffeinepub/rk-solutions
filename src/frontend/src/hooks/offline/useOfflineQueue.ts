import { useState, useEffect } from 'react';

interface QueuedOperation {
  type: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export function useOfflineQueue() {
  const [queuedOperations, setQueuedOperations] = useState<QueuedOperation[]>([]);

  const queuedCount = queuedOperations.filter((op) => op.status === 'pending').length;

  const retrySync = () => {
    // Placeholder for retry logic
    console.log('Retry sync triggered');
  };

  return {
    queuedOperations,
    queuedCount,
    retrySync,
  };
}
