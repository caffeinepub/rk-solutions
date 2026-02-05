import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Info } from 'lucide-react';

export default function AccessLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Access Logs</h1>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Access logs functionality will be available in a future update. This will include sign-up logs,
          login activity, and user access patterns.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No logs available yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
