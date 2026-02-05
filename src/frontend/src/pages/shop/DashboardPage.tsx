import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetCallerUserProfile, useGetShopAnalytics } from '../../hooks/useQueries';
import { Package, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: analytics, isLoading } = useGetShopAnalytics(profile?.shopId ?? null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const totalProducts = analytics ? Number(analytics.totalProducts) : 0;
  const lowStockCount = analytics ? Number(analytics.lowStockCount) : 0;
  const outOfStockCount = analytics ? Number(analytics.outOfStockCount) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name || 'User'}</p>
        </div>
        <Link to="/shop/products/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProducts}</div>
            <Link to="/shop/products">
              <Button variant="link" className="mt-2 h-auto p-0 text-sm">
                View all products →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{lowStockCount}</div>
            <Link to="/shop/alerts">
              <Button variant="link" className="mt-2 h-auto p-0 text-sm text-orange-600">
                View alerts →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{outOfStockCount}</div>
            <Link to="/shop/alerts">
              <Button variant="link" className="mt-2 h-auto p-0 text-sm text-red-600">
                View alerts →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Attention Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outOfStockCount > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      {outOfStockCount} {outOfStockCount === 1 ? 'product is' : 'products are'} out of stock
                    </p>
                    <p className="text-sm text-red-700">Restock immediately to avoid lost sales</p>
                  </div>
                </div>
                <Link to="/shop/alerts">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            )}
            {lowStockCount > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">
                      {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} running low
                    </p>
                    <p className="text-sm text-orange-700">Consider restocking soon</p>
                  </div>
                </div>
                <Link to="/shop/alerts">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
