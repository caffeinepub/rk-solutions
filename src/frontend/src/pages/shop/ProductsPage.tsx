import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetCallerUserProfile, useGetShopProducts, useDeleteProduct } from '../../hooks/useQueries';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
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
import type { Product } from '../../backend';

type StockFilter = 'all' | 'inStock' | 'lowStock' | 'outOfStock';

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
        Low Stock ({Number(product.quantity)})
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800">
      In Stock ({Number(product.quantity)})
    </Badge>
  );
}

export default function ProductsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: products = [], isLoading } = useGetShopProducts(profile?.shopId ?? null);
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (stockFilter === 'all') return true;
    return getStockStatus(product) === stockFilter;
  });

  const handleDelete = (productId: bigint) => {
    if (!profile?.shopId) return;
    deleteProduct.mutate({ productId, shopId: profile.shopId });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Link to="/shop/products/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as StockFilter)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="inStock">In Stock</SelectItem>
                <SelectItem value="lowStock">Low Stock</SelectItem>
                <SelectItem value="outOfStock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {products.length === 0 ? 'No products yet. Add your first product to get started.' : 'No products match your search.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <StockBadge product={product} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description || 'No description'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <Link to="/shop/products/$productId" params={{ productId: product.id.toString() }}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link to="/shop/products/$productId/edit" params={{ productId: product.id.toString() }}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
