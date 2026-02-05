import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // --- Types and Modules ---
  type ShopId = Nat;
  type ProductId = Nat;
  type StockMovementId = Nat;

  public type UserProfile = {
    name : Text;
    email : Text;
    shopId : ?ShopId; // null for super-admin
  };

  type ShopDashboard = {
    totalProducts : Nat;
    lowStockCount : Nat;
    outOfStockCount : Nat;
    lowStockProducts : [Product];
    outOfStockProducts : [Product];
  };

  type StockStatus = {
    #inStock;
    #lowStock : Nat; // current quantity
    #outOfStock;
  };

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    quantity : Nat;
    lowStockThreshold : Nat;
    shopId : ShopId;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  type Shop = {
    id : ShopId;
    name : Text;
    isActive : Bool;
    isSuspended : Bool;
    owner : Principal;
    lastUpdated : Time.Time;
  };

  module Shop {
    public func compare(shop1 : Shop, shop2 : Shop) : Order.Order {
      Text.compare(shop1.name, shop2.name);
    };
  };

  type StockMovement = {
    id : StockMovementId;
    productId : ProductId;
    shopId : ShopId;
    quantityChange : Int;
    timestamp : Time.Time;
  };

  // --- Storage ---
  let products = Map.empty<ProductId, Product>();
  let shops = Map.empty<ShopId, Shop>();
  let stockMovements = Map.empty<StockMovementId, StockMovement>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextShopId : ShopId = 0;
  var nextProductId : ProductId = 0;
  var nextStockMovementId : StockMovementId = 0;

  // --- Authorization ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- User Profile Functions (Required by Frontend) ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // SECURITY FIX: Preserve existing shopId - only admins can change shop assignments
    let finalProfile = switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        {
          name = profile.name;
          email = profile.email;
          shopId = existingProfile.shopId; // Preserve existing shop assignment
        };
      };
      case (null) {
        {
          name = profile.name;
          email = profile.email;
          shopId = null; // New users start with no shop assignment
        };
      };
    };

    userProfiles.add(caller, finalProfile);
  };

  // --- Admin Function to Assign Users to Shops ---
  public shared ({ caller }) func assignUserToShop(user : Principal, shopId : ?ShopId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign users to shops");
    };

    // Verify shop exists if shopId is provided
    switch (shopId) {
      case (?sid) {
        switch (shops.get(sid)) {
          case (null) { Runtime.trap("Shop not found") };
          case (?_) {};
        };
      };
      case (null) {};
    };

    // Update or create user profile with new shop assignment
    let profile = switch (userProfiles.get(user)) {
      case (?existingProfile) {
        {
          name = existingProfile.name;
          email = existingProfile.email;
          shopId = shopId;
        };
      };
      case (null) {
        {
          name = "";
          email = "";
          shopId = shopId;
        };
      };
    };

    userProfiles.add(user, profile);
  };

  // --- Helper Functions ---
  func getCallerShopId(caller : Principal) : ?ShopId {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.shopId };
      case (null) { null };
    };
  };

  func validateShopUser(caller : Principal, shopId : ShopId) {
    // Super-admins cannot access shop inventory data
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Super-admins cannot access shop inventory data");
    };

    // Must be a regular user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only shop users can access this resource");
    };

    // Must belong to the requested shop
    switch (getCallerShopId(caller)) {
      case (?callerShopId) {
        if (callerShopId != shopId) {
          Runtime.trap("Unauthorized: Can only access your own shop data");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not associated with any shop");
      };
    };
  };

  func validateProductAccess(caller : Principal, productId : ProductId) {
    switch (products.get(productId)) {
      case (?product) {
        validateShopUser(caller, product.shopId);
      };
      case (null) {
        Runtime.trap("Product not found");
      };
    };
  };

  func validateAdminOnly(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only super-admins can perform this action");
    };
  };

  // --- Shop Functions (Admin Only - No Inventory Access) ---
  public query ({ caller }) func getShop(shopId : ShopId) : async Shop {
    validateAdminOnly(caller);
    switch (shops.get(shopId)) {
      case (?shop) { shop };
      case (null) { Runtime.trap("Shop not found") };
    };
  };

  public query ({ caller }) func getAllShops() : async [Shop] {
    validateAdminOnly(caller);
    shops.values().toArray().sort();
  };

  // --- NEW: Shop Creation Flow for Non-Admins ---
  public shared ({ caller }) func createAndAssignShop(name : Text) : async ShopId {
    // Regular users cannot specify a shop owner
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: This endpoint is only for regular users. Admins should use createShop instead.");
    };

    // Check if the user already owns a shop
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.shopId) {
          case (?_) {
            // User already has a shop
            Runtime.trap("User already owns a shop. Use update functions instead.");
          };
          case (null) {};
        };
      };
      case (null) {}; // User profile not found
    };

    let shopId = nextShopId;
    nextShopId += 1;

    let shop : Shop = {
      id = shopId;
      name;
      isActive = true;
      isSuspended = false;
      owner = caller;
      lastUpdated = Time.now();
    };
    shops.add(shopId, shop);

    // Assign the user to the new shop
    let updatedProfile = switch (userProfiles.get(caller)) {
      case (?profile) {
        { profile with shopId = ?shopId };
      };
      case (null) {
        {
          name = "";
          email = "";
          shopId = ?shopId;
        };
      };
    };
    userProfiles.add(caller, updatedProfile);

    shopId;
  };

  // --- Admin Shop Creation ---
  public shared ({ caller }) func createShop(name : Text, owner : Principal) : async ShopId {
    validateAdminOnly(caller);

    let shopId = nextShopId;
    nextShopId += 1;

    let shop : Shop = {
      id = shopId;
      name;
      isActive = true;
      isSuspended = false;
      owner;
      lastUpdated = Time.now();
    };
    shops.add(shopId, shop);
    shopId;
  };

  public shared ({ caller }) func suspendShop(shopId : ShopId) : async () {
    validateAdminOnly(caller);
    switch (shops.get(shopId)) {
      case (?shop) {
        let updatedShop : Shop = {
          id = shop.id;
          name = shop.name;
          isActive = shop.isActive;
          isSuspended = true;
          owner = shop.owner;
          lastUpdated = Time.now();
        };
        shops.add(shopId, updatedShop);
      };
      case (null) { Runtime.trap("Shop not found") };
    };
  };

  public shared ({ caller }) func reactivateShop(shopId : ShopId) : async () {
    validateAdminOnly(caller);
    switch (shops.get(shopId)) {
      case (?shop) {
        let updatedShop : Shop = {
          id = shop.id;
          name = shop.name;
          isActive = true;
          isSuspended = false;
          owner = shop.owner;
          lastUpdated = Time.now();
        };
        shops.add(shopId, updatedShop);
      };
      case (null) { Runtime.trap("Shop not found") };
    };
  };

  // --- Product Functions (Shop Users Only - Tenant Isolated) ---
  public shared ({ caller }) func createProduct(shopId : ShopId, name : Text, description : Text, initialQuantity : Nat, lowStockThreshold : Nat) : async ProductId {
    validateShopUser(caller, shopId);

    // Verify shop is not suspended
    switch (shops.get(shopId)) {
      case (?shop) {
        if (shop.isSuspended) {
          Runtime.trap("Shop is suspended");
        };
      };
      case (null) { Runtime.trap("Shop not found") };
    };

    let productId = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id = productId;
      name;
      description;
      quantity = initialQuantity;
      lowStockThreshold;
      shopId;
    };
    products.add(productId, product);
    productId;
  };

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    validateProductAccess(caller, productId);
    switch (products.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getShopProducts(shopId : ShopId) : async [Product] {
    validateShopUser(caller, shopId);
    products.values().toArray().filter(func(product) { product.shopId == shopId }).sort();
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, name : Text, description : Text, lowStockThreshold : Nat) : async () {
    validateProductAccess(caller, productId);

    switch (products.get(productId)) {
      case (?product) {
        let updatedProduct : Product = {
          id = product.id;
          name;
          description;
          quantity = product.quantity;
          lowStockThreshold;
          shopId = product.shopId;
        };
        products.add(productId, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    validateProductAccess(caller, productId);
    products.remove(productId);
  };

  // --- Stock Movement Functions (Shop Users Only - Tenant Isolated) ---
  public shared ({ caller }) func updateStock(productId : ProductId, quantityChange : Int) : async () {
    validateProductAccess(caller, productId);

    let product = switch (products.get(productId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Product not found") };
    };

    let newQuantity = if (quantityChange < 0) {
      let absChange = Int.abs(quantityChange);
      if (absChange > product.quantity) {
        Runtime.trap("Cannot reduce quantity below 0");
      } else {
        (product.quantity + quantityChange).toNat();
      };
    } else {
      product.quantity + quantityChange.toNat();
    };

    let updatedProduct : Product = {
      id = product.id;
      name = product.name;
      description = product.description;
      quantity = newQuantity;
      lowStockThreshold = product.lowStockThreshold;
      shopId = product.shopId;
    };

    products.add(productId, updatedProduct);

    // Record stock movement
    let movementId = nextStockMovementId;
    nextStockMovementId += 1;

    let movement : StockMovement = {
      id = movementId;
      productId;
      shopId = product.shopId;
      quantityChange;
      timestamp = Time.now();
    };

    stockMovements.add(movementId, movement);
  };

  public query ({ caller }) func getStockMovements(productId : ProductId) : async [StockMovement] {
    validateProductAccess(caller, productId);
    stockMovements.values().toArray().filter(func(m) { m.productId == productId });
  };

  public query ({ caller }) func getShopStockMovements(shopId : ShopId) : async [StockMovement] {
    validateShopUser(caller, shopId);
    stockMovements.values().toArray().filter(func(m) { m.shopId == shopId });
  };

  // --- Shop Analytics (Shop Users Only - Tenant Isolated) ---
  public query ({ caller }) func getShopAnalytics(shopId : ShopId) : async ShopDashboard {
    validateShopUser(caller, shopId);

    let shopProducts = products.values().toArray().filter(func(p) { p.shopId == shopId });
    let totalProducts = shopProducts.size();

    let lowStockProducts = shopProducts.filter(func(p) { p.quantity <= p.lowStockThreshold and p.quantity > 0 });
    let outOfStockProducts = shopProducts.filter(func(p) { p.quantity == 0 });

    {
      totalProducts;
      lowStockCount = lowStockProducts.size();
      outOfStockCount = outOfStockProducts.size();
      lowStockProducts;
      outOfStockProducts;
    };
  };

  // --- Stock Status (Shop Users Only - Tenant Isolated) ---
  public query ({ caller }) func getStockStatus(productId : ProductId) : async StockStatus {
    validateProductAccess(caller, productId);

    switch (products.get(productId)) {
      case (?product) {
        if (product.quantity == 0) {
          #outOfStock;
        } else if (product.quantity <= product.lowStockThreshold) {
          #lowStock(product.quantity);
        } else {
          #inStock;
        };
      };
      case (null) {
        Runtime.trap("Product not found");
      };
    };
  };

  public query ({ caller }) func getLowStockProducts(shopId : ShopId) : async [Product] {
    validateShopUser(caller, shopId);
    products.values().toArray().filter(func(p) {
      p.shopId == shopId and p.quantity > 0 and p.quantity <= p.lowStockThreshold
    }).sort();
  };

  public query ({ caller }) func getOutOfStockProducts(shopId : ShopId) : async [Product] {
    validateShopUser(caller, shopId);
    products.values().toArray().filter(func(p) {
      p.shopId == shopId and p.quantity == 0
    }).sort();
  };
};
