import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Shield, ShieldAlert } from 'lucide-react';
import { useResetSuperAdmin } from '../../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminHomePage() {
  const resetSuperAdmin = useResetSuperAdmin();

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

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Super Admin Recovery</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-700">
            If you're having trouble accessing admin features, you can use the recovery tool to bootstrap
            super-admin access. This only works if no super-admin exists in the system.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100">
                <ShieldAlert className="h-4 w-4" />
                Recover Super Admin Access
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recover Super Admin Access</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This will grant super-admin privileges to your current account, but only if no super-admin
                    exists in the system.
                  </p>
                  <p className="font-medium text-foreground">
                    If a super-admin already exists, this operation will fail and you must contact the existing
                    super-admin for access.
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    This is a bootstrap recovery feature for initial setup or when admin access has been lost.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => resetSuperAdmin.mutate()}
                  disabled={resetSuperAdmin.isPending}
                >
                  {resetSuperAdmin.isPending ? 'Processing...' : 'Grant Access'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

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
