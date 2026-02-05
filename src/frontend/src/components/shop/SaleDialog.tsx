import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateStock } from '../../hooks/useQueries';
import type { Product } from '../../backend';

interface SaleDialogProps {
  product: Product;
  shopId: bigint;
  onClose: () => void;
}

export default function SaleDialog({ product, shopId, onClose }: SaleDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const updateStock = useUpdateStock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (qty <= 0 || qty > Number(product.quantity)) return;

    await updateStock.mutateAsync({
      productId: product.id,
      quantityChange: BigInt(-qty),
      shopId,
    });

    onClose();
  };

  const maxQuantity = Number(product.quantity);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Sale - {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Sold</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Available: {maxQuantity} units
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateStock.isPending}>
              {updateStock.isPending ? 'Recording...' : 'Record Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
