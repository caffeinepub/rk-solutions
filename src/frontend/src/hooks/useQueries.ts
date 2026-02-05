import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Product, Shop, ShopDashboard, StockMovement } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetShopProducts(shopId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['shopProducts', shopId?.toString()],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      return actor.getShopProducts(shopId);
    },
    enabled: !!actor && !actorFetching && shopId !== null,
  });
}

export function useGetProduct(productId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !actorFetching && productId !== null,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shopId: bigint;
      name: string;
      description: string;
      initialQuantity: bigint;
      lowStockThreshold: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(
        data.shopId,
        data.name,
        data.description,
        data.initialQuantity,
        data.lowStockThreshold
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopProducts', variables.shopId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopAnalytics', variables.shopId.toString()] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      name: string;
      description: string;
      lowStockThreshold: bigint;
      shopId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProduct(data.productId, data.name, data.description, data.lowStockThreshold);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopProducts', variables.shopId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopAnalytics', variables.shopId.toString()] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; shopId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteProduct(data.productId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopProducts', variables.shopId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopAnalytics', variables.shopId.toString()] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });
}

export function useUpdateStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; quantityChange: bigint; shopId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateStock(data.productId, data.quantityChange);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopProducts', variables.shopId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopAnalytics', variables.shopId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements', variables.productId.toString()] });
      toast.success('Stock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock: ${error.message}`);
    },
  });
}

export function useGetShopAnalytics(shopId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShopDashboard | null>({
    queryKey: ['shopAnalytics', shopId?.toString()],
    queryFn: async () => {
      if (!actor || !shopId) return null;
      return actor.getShopAnalytics(shopId);
    },
    enabled: !!actor && !actorFetching && shopId !== null,
  });
}

export function useGetStockMovements(productId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StockMovement[]>({
    queryKey: ['stockMovements', productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) return [];
      return actor.getStockMovements(productId);
    },
    enabled: !!actor && !actorFetching && productId !== null,
  });
}

export function useGetAllShops() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['allShops'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllShops();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      const shopId = await actor.createAndAssignShop(data.name);
      return shopId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Shop created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create shop';
      toast.error(`Failed to create shop: ${errorMessage}`);
    },
  });
}

export function useSuspendShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.suspendShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      toast.success('Shop suspended successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to suspend shop: ${error.message}`);
    },
  });
}

export function useReactivateShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reactivateShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      toast.success('Shop reactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reactivate shop: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useResetSuperAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.resetSuperAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      toast.success('Super admin access granted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset super admin: ${error.message}`);
    },
  });
}
