import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetAllShops, useSuspendShop, useReactivateShop, useResetSuperAdmin } from '../../hooks/useQueries';
import { Building2, Ban, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function ShopsAdminPage() {
  const { data: shops = [], isLoading, isError, error, refetch } = useGetAllShops();
  const suspendShop = useSuspendShop();
  const reactivateShop = useReactivateShop();
  const resetSuperAdmin = useResetSuperAdmin();

  const handleResetSuperAdmin = async () => {
    await resetSuperAdmin.mutateAsync();
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError) {
    const errorMessage = error?.message || 'Failed to load shops';
    const isUnauthorized = errorMessage.includes('Unauthorized') || errorMessage.includes('Only super-admins');

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
        </div>

        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {isUnauthorized
                    ? 'You do not have super-admin privileges. Only super-admins can view and manage shops.'
                    : errorMessage}
                </p>
              </div>

              {isUnauthorized && (
                <div className="flex flex-col items-center gap-3 pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" className="gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Recover Super Admin Access
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Recover Super Admin Access</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            This will grant super-admin privileges to your current account, but only if no
                            super-admin exists in the system.
                          </p>
                          <p className="font-medium text-foreground">
                            If a super-admin already exists, this operation will fail and you must contact the
                            existing super-admin for access.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleResetSuperAdmin}
                          disabled={resetSuperAdmin.isPending}
                        >
                          {resetSuperAdmin.isPending ? 'Processing...' : 'Grant Access'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-xs text-muted-foreground">
                    This is a bootstrap recovery feature for initial setup
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
      </div>

      {shops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No shops registered yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Shops ({shops.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shops.map((shop) => (
                <div
                  key={shop.id.toString()}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{shop.name}</p>
                      {shop.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : shop.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Created: {new Date(Number(shop.lastUpdated) / 1000000).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {shop.isSuspended ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Reactivate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reactivate Shop</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reactivate "{shop.name}"? Users will be able to log in
                              and access the shop again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => reactivateShop.mutate(shop.id)}>
                              Reactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Ban className="h-4 w-4" />
                            Suspend
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend Shop</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to suspend "{shop.name}"? Users will not be able to log in
                              or access the shop until it is reactivated.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => suspendShop.mutate(shop.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Suspend
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
