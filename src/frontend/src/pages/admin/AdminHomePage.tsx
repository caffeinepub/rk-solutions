import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Shield } from 'lucide-react';

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Shop Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View all shop accounts, suspend or reactivate shops, and manage shop status.
            </p>
            <Link to="/admin/shops">
              <Button className="w-full">Manage Shops</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Access Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View sign-up and access logs for all shops and users.
            </p>
            <Link to="/admin/logs">
              <Button className="w-full">View Logs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Admin Access Notice</p>
              <p className="mt-1 text-sm text-orange-700">
                As a super-admin, you can manage shop accounts and users but cannot view any shop inventory
                data. This ensures tenant data privacy and security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
