import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { useNetworkStatus } from '../../hooks/offline/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/offline/useOfflineQueue';

export default function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const { queuedCount } = useOfflineQueue();

  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <Link to="/shop/sync">
      <Button variant="ghost" size="sm" className="gap-2">
        {isOnline ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm">Syncing...</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-600" />
            <span className="text-sm">Offline</span>
          </>
        )}
        {queuedCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {queuedCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
