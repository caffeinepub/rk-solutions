import { useState } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetProduct, useGetStockMovements, useGetCallerUserProfile } from '../../hooks/useQueries';
import { ArrowLeft, Edit, TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SaleDialog from '../../components/shop/SaleDialog';
import StockInDialog from '../../components/shop/StockInDialog';
import type { Product } from '../../backend';

function getStockStatus(product: Product): 'inStock' | 'lowStock' | 'outOfStock' {
  const qty = Number(product.quantity);
  const threshold = Number(product.lowStockThreshold);

  if (qty === 0) return 'outOfStock';
  if (qty <= threshold) return 'lowStock';
  return 'inStock';
}

function StockBadge({ product }: { product: Product }) {
  const status = getStockStatus(product);

  if (status === 'outOfStock') {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (status === 'lowStock') {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800">
      In Stock
    </Badge>
  );
}

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams({ from: '/shop/products/$productId' });
  const { data: profile } = useGetCallerUserProfile();
  const { data: product, isLoading } = useGetProduct(BigInt(productId));
  const { data: movements = [] } = useGetStockMovements(BigInt(productId));

  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showStockInDialog, setShowStockInDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const recentMovements = movements.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/shop/products' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <StockBadge product={product} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Information</CardTitle>
              <Link to="/shop/products/$productId/edit" params={{ productId }}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1">{product.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
                <p className="mt-1 text-2xl font-bold">{Number(product.quantity)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Threshold</p>
                <p className="mt-1 text-2xl font-bold">{Number(product.lowStockThreshold)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setShowSaleDialog(true)}
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={Number(product.quantity) === 0}
            >
              <TrendingDown className="h-4 w-4" />
              Record Sale
            </Button>
            <Button
              onClick={() => setShowStockInDialog(true)}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Add Stock
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements.length === 0 ? (
            <p className="text-center text-muted-foreground">No stock movements yet</p>
          ) : (
            <div className="space-y-2">
              {recentMovements.map((movement) => {
                const change = Number(movement.quantityChange);
                const isPositive = change > 0;
                return (
                  <div
                    key={movement.id.toString()}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {isPositive ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {isPositive ? 'Stock In' : 'Sale'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Number(movement.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isPositive ? 'secondary' : 'outline'}>
                      {isPositive ? '+' : ''}{change}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showSaleDialog && product && profile?.shopId && (
        <SaleDialog
          product={product}
          shopId={profile.shopId}
          onClose={() => setShowSaleDialog(false)}
        />
      )}

      {showStockInDialog && product && profile?.shopId && (
        <StockInDialog
          product={product}
          shopId={profile.shopId}
          onClose={() => setShowStockInDialog(false)}
        />
      )}
    </div>
  );
}
