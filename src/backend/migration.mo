import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  // Old types
  type ShopId = Nat;
  type ProductId = Nat;
  type StockMovementId = Nat;

  type OldUserProfile = {
    name : Text;
    email : Text;
    shopId : ?ShopId; // null for super-admin
  };

  type OldProduct = {
    id : ProductId;
    name : Text;
    description : Text;
    quantity : Nat;
    lowStockThreshold : Nat;
    shopId : ShopId;
  };

  type OldShop = {
    id : ShopId;
    name : Text;
    isActive : Bool;
    isSuspended : Bool;
    owner : Principal;
    lastUpdated : Time.Time;
  };

  type OldStockMovement = {
    id : StockMovementId;
    productId : ProductId;
    shopId : ShopId;
    quantityChange : Int;
    timestamp : Time.Time;
  };

  type OldActor = {
    products : Map.Map<ProductId, OldProduct>;
    shops : Map.Map<ShopId, OldShop>;
    stockMovements : Map.Map<StockMovementId, OldStockMovement>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextShopId : ShopId;
    nextProductId : ProductId;
    nextStockMovementId : StockMovementId;
    accessControlState : AccessControl.AccessControlState;
  };

  // New types
  type NewUserProfile = {
    name : Text;
    email : Text;
    shopId : ?ShopId;
    isSuperAdmin : Bool;
  };

  type NewProduct = OldProduct;
  type NewShop = OldShop;
  type NewStockMovement = OldStockMovement;

  type NewActor = {
    products : Map.Map<ProductId, NewProduct>;
    shops : Map.Map<ShopId, NewShop>;
    stockMovements : Map.Map<StockMovementId, NewStockMovement>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    nextShopId : ShopId;
    nextProductId : ProductId;
    nextStockMovementId : StockMovementId;
    accessControlState : AccessControl.AccessControlState;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        {
          name = oldProfile.name;
          email = oldProfile.email;
          shopId = oldProfile.shopId;
          isSuperAdmin = false; // Default to non-super-admin
        };
      }
    );

    {
      products = old.products;
      shops = old.shops;
      stockMovements = old.stockMovements;
      userProfiles = newUserProfiles;
      nextShopId = old.nextShopId;
      nextProductId = old.nextProductId;
      nextStockMovementId = old.nextStockMovementId;
      accessControlState = old.accessControlState;
    };
  };
};
