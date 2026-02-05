import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNetworkStatus } from '../../hooks/offline/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/offline/useOfflineQueue';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function SyncStatusPage() {
  const { isOnline } = useNetworkStatus();
  const { queuedOperations, queuedCount, retrySync } = useOfflineQueue();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sync Status</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-orange-600" />
                Offline
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isOnline
              ? 'Connected to the internet. Changes will sync automatically.'
              : 'No internet connection. Changes will be saved locally and synced when you reconnect.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queued Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queuedCount === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p>All changes are synced</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {queuedCount} {queuedCount === 1 ? 'operation' : 'operations'} pending
                </p>
                <Button onClick={retrySync} size="sm" variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Sync
                </Button>
              </div>

              <div className="space-y-2">
                {queuedOperations.map((op, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{op.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(op.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={op.status === 'failed' ? 'destructive' : 'secondary'}>
                        {op.status}
                      </Badge>
                    </div>
                    {op.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{op.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Conflict Resolution Policy:</strong> For product edits, the last change wins based on
          timestamp. Sales and stock movements are applied in the order they were recorded. If a sale would
          result in negative stock, it will fail and remain queued for manual review.
        </AlertDescription>
      </Alert>
    </div>
  );
}
