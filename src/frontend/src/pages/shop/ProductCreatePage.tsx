import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetCallerUserProfile, useCreateProduct } from '../../hooks/useQueries';
import { ArrowLeft } from 'lucide-react';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const createProduct = useCreateProduct();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [threshold, setThreshold] = useState('10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.shopId) return;

    await createProduct.mutateAsync({
      shopId: profile.shopId,
      name,
      description,
      initialQuantity: BigInt(quantity),
      lowStockThreshold: BigInt(threshold),
    });

    navigate({ to: '/shop/products' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/shop/products' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
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
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? 'Creating...' : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/shop/products' })}
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
