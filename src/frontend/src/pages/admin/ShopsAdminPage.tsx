import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetAllShops, useSuspendShop, useReactivateShop } from '../../hooks/useQueries';
import { Building2, Ban, CheckCircle } from 'lucide-react';
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
  const { data: shops = [], isLoading } = useGetAllShops();
  const suspendShop = useSuspendShop();
  const reactivateShop = useReactivateShop();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
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
