import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useGetShopAnalytics } from '../../hooks/useQueries';
import { AlertTriangle, XCircle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: analytics, isLoading } = useGetShopAnalytics(profile?.shopId ?? null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const lowStockProducts = analytics?.lowStockProducts || [];
  const outOfStockProducts = analytics?.outOfStockProducts || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Stock Alerts</h1>

      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">All products are well stocked</p>
            <p className="text-sm text-muted-foreground">No alerts at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {outOfStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-900">Out of Stock ({outOfStockProducts.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outOfStockProducts.map((product) => (
                    <div
                      key={product.id.toString()}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-red-900">{product.name}</p>
                        <p className="text-sm text-red-700">Quantity: 0</p>
                      </div>
                      <Link to="/shop/products/$productId" params={{ productId: product.id.toString() }}>
                        <Button variant="outline" size="sm">
                          Restock
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-orange-900">Low Stock ({lowStockProducts.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id.toString()}
                      className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-orange-900">{product.name}</p>
                        <p className="text-sm text-orange-700">
                          Quantity: {Number(product.quantity)} (Threshold: {Number(product.lowStockThreshold)})
                        </p>
                      </div>
                      <Link to="/shop/products/$productId" params={{ productId: product.id.toString() }}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
