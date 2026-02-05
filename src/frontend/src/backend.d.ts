import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ShopId = bigint;
export interface Product {
    id: ProductId;
    lowStockThreshold: bigint;
    shopId: ShopId;
    name: string;
    description: string;
    quantity: bigint;
}
export type Time = bigint;
export type StockMovementId = bigint;
export type StockStatus = {
    __kind__: "inStock";
    inStock: null;
} | {
    __kind__: "outOfStock";
    outOfStock: null;
} | {
    __kind__: "lowStock";
    lowStock: bigint;
};
export type ProductId = bigint;
export interface Shop {
    id: ShopId;
    owner: Principal;
    name: string;
    lastUpdated: Time;
    isActive: boolean;
    isSuspended: boolean;
}
export interface StockMovement {
    id: StockMovementId;
    shopId: ShopId;
    quantityChange: bigint;
    productId: ProductId;
    timestamp: Time;
}
export interface UserProfile {
    shopId?: ShopId;
    name: string;
    isSuperAdmin: boolean;
    email: string;
}
export interface ShopDashboard {
    totalProducts: bigint;
    outOfStockProducts: Array<Product>;
    outOfStockCount: bigint;
    lowStockCount: bigint;
    lowStockProducts: Array<Product>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserToShop(user: Principal, shopId: ShopId | null): Promise<void>;
    createAndAssignShop(name: string): Promise<ShopId>;
    createProduct(shopId: ShopId, name: string, description: string, initialQuantity: bigint, lowStockThreshold: bigint): Promise<ProductId>;
    createShop(name: string, owner: Principal): Promise<ShopId>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllShops(): Promise<Array<Shop>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLowStockProducts(shopId: ShopId): Promise<Array<Product>>;
    getOutOfStockProducts(shopId: ShopId): Promise<Array<Product>>;
    getProduct(productId: ProductId): Promise<Product>;
    getShop(shopId: ShopId): Promise<Shop>;
    getShopAnalytics(shopId: ShopId): Promise<ShopDashboard>;
    getShopProducts(shopId: ShopId): Promise<Array<Product>>;
    getShopStockMovements(shopId: ShopId): Promise<Array<StockMovement>>;
    getStockMovements(productId: ProductId): Promise<Array<StockMovement>>;
    getStockStatus(productId: ProductId): Promise<StockStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reactivateShop(shopId: ShopId): Promise<void>;
    resetSuperAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    suspendShop(shopId: ShopId): Promise<void>;
    updateProduct(productId: ProductId, name: string, description: string, lowStockThreshold: bigint): Promise<void>;
    updateStock(productId: ProductId, quantityChange: bigint): Promise<void>;
}
