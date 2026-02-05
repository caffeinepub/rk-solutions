import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetProduct, useUpdateProduct, useGetCallerUserProfile } from '../../hooks/useQueries';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { productId } = useParams({ from: '/shop/products/$productId/edit' });
  const { data: profile } = useGetCallerUserProfile();
  const { data: product, isLoading } = useGetProduct(BigInt(productId));
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [threshold, setThreshold] = useState('10');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setThreshold(product.lowStockThreshold.toString());
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !profile?.shopId) return;

    await updateProduct.mutateAsync({
      productId: product.id,
      name,
      description,
      lowStockThreshold: BigInt(threshold),
      shopId: profile.shopId,
    });

    navigate({ to: `/shop/products/${productId}` });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/shop/products/${productId}` })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Threshold *</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Alert when stock falls to or below this level
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: `/shop/products/${productId}` })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
