import {
  users,
  products,
  cartItems,
  favorites,
  orders,
  orderItems,
  payments,
  library,
  liveMetrics,
  shipmentTracking,
  productImages,
  categories,
  marketingPush,
  frontPageMedia,
  fomoTimers,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Favorite,
  type InsertFavorite,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Payment,
  type InsertPayment,
  type Library,
  type InsertLibrary,
  type LiveMetrics,
  type InsertLiveMetrics,
  type ShipmentTracking,
  type InsertShipmentTracking,
  type ProductImage,
  type InsertProductImage,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: any): Promise<User>;

  // Product operations
  getProducts(category?: string, search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  incrementViewCount(id: number): Promise<void>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Favorites operations
  getFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: number): Promise<void>;
  isFavorite(userId: string, productId: number): Promise<boolean>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  addOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(userId: string): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  getUserPayments(userId: string): Promise<Payment[]>;

  // Library operations
  getUserLibrary(userId: string): Promise<(Library & { product: Product })[]>;
  addToLibrary(library: InsertLibrary): Promise<Library>;
  hasAccess(userId: string, productId: number): Promise<boolean>;

  // Live metrics operations
  getLiveMetrics(productId: number): Promise<LiveMetrics | undefined>;
  updateLiveMetrics(productId: number, metrics: Partial<InsertLiveMetrics>): Promise<LiveMetrics>;

  // Marketing campaigns operations
  getMarketingCampaigns(): Promise<any[]>;
  createMarketingCampaign(campaign: any): Promise<any>;
  deleteMarketingCampaign(id: number): Promise<void>;
  getActiveBanners(): Promise<any[]>;

  // Front page media operations
  getFrontPageMedia(): Promise<any[]>;
  createFrontPageMedia(media: any): Promise<any>;
  updateFrontPageMedia(id: number, media: any): Promise<any>;
  deleteFrontPageMedia(id: number): Promise<void>;

  // FOMO timers operations
  getFomoTimers(): Promise<any[]>;
  createFomoTimer(timer: any): Promise<any>;
  updateFomoTimer(id: number, timer: any): Promise<any>;
  resetFomoTimer(id: number): Promise<any>;

  // Order tracking and shipping operations
  updateOrderStatus(orderId: number, status: string, trackingData?: any): Promise<Order>;
  getOrderWithTracking(orderId: number): Promise<Order & { tracking?: any[] } | undefined>;
  addTrackingEvent(orderId: number, trackingData: any): Promise<any>;
  getTrackingHistory(orderId: number): Promise<any[]>;
  generateTrackingNumber(): string;

  // Product images operations
  getProductImages(productId: number): Promise<ProductImage[]>;
  addProductImage(image: InsertProductImage): Promise<ProductImage>;
  updateProductImage(id: number, image: Partial<InsertProductImage>): Promise<ProductImage>;
  deleteProductImage(id: number): Promise<void>;
  setPrimaryImage(productId: number, imageId: number): Promise<void>;
  getAllProductImagesWithDetails(): Promise<any[]>;

  // Categories operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        profileImageUrl: data.profileImageUrl,
        instagramLink: data.instagramLink,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Product operations
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);

    if (category && category !== 'all-products' && category !== 'all') {
      query = query.where(eq(products.category, category)) as any;
    }

    if (search) {
      query = query.where(
        ilike(products.name, `%${search}%`)
      ) as any;
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(products)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    return result.map(row => ({
      ...row.cart_items,
      product: row.products,
    }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values(cartItem)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Favorites operations
  async getFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    const result = await db
      .select()
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId));

    return result.map(row => ({
      ...row.favorites,
      product: row.products,
    }));
  }

  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFromFavorites(userId: string, productId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.productId, productId)
        )
      );
  }

  async isFavorite(userId: string, productId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.productId, productId)
        )
      );
    return !!favorite;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async getOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async addOrderItems(orderItemsList: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db
      .insert(orderItems)
      .values(orderItemsList)
      .returning();
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Library operations - STRICT POST-PURCHASE ACCESS ONLY
  async getUserLibrary(userId: string): Promise<(Library & { product: Product })[]> {
    console.log(`🔍 STORAGE: getUserLibrary called for userId: ${userId}`);
    
    try {
      // Only return content that has BOTH library access AND completed payment
      const results = await db
        .select({
          id: library.id,
          userId: library.userId,
          productId: library.productId,
          accessGranted: library.accessGranted,
          purchaseDate: library.purchaseDate,
          createdAt: library.createdAt,
          product: {
            id: products.id,
            name: products.name,
            brand: products.brand,
            description: products.description,
            price: products.price,
            originalPrice: products.originalPrice,
            category: products.category,
            imageUrl: products.imageUrl,
            demoLink: products.demoLink,
            accessLink: products.accessLink,
            razorpayLink: products.razorpayLink,
            rating: products.rating,
            reviewCount: products.reviewCount,
            viewCount: products.viewCount,
            soldCount: products.soldCount,
            inStock: products.inStock,
            isHighDemand: products.isHighDemand,
            hasInstantAccess: products.hasInstantAccess,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
          }
        })
        .from(library)
        .innerJoin(products, eq(library.productId, products.id))
        .innerJoin(payments, and(
          eq(payments.userId, library.userId),
          eq(payments.productId, library.productId),
          eq(payments.status, 'completed')
        ))
        .where(and(
          eq(library.userId, userId),
          eq(library.accessGranted, true)
        ))
        .orderBy(desc(library.purchaseDate));

      console.log(`🔍 STORAGE: Raw query results for ${userId}:`, results.length, 'items');
      console.log(`🔍 STORAGE: Results preview:`, results.map(r => ({ 
        id: r.id, 
        productId: r.productId, 
        productName: r.product?.name,
        accessGranted: r.accessGranted 
      })));

      return results as (Library & { product: Product })[];
    } catch (error) {
      console.error(`❌ STORAGE ERROR in getUserLibrary for ${userId}:`, error);
      throw error;
    }
  }

  async addToLibrary(libraryItem: InsertLibrary): Promise<Library> {
    // STRICT VERIFICATION: Only add to library if payment exists and is completed
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.userId, libraryItem.userId),
        eq(payments.productId, libraryItem.productId),
        eq(payments.status, 'completed')
      ));

    if (!existingPayment) {
      throw new Error('Cannot add to library: No completed payment found for this product');
    }

    // Check if library access already exists
    const [existingLibraryItem] = await db
      .select()
      .from(library)
      .where(and(
        eq(library.userId, libraryItem.userId),
        eq(library.productId, libraryItem.productId)
      ));

    if (existingLibraryItem) {
      throw new Error('Library access already exists for this product');
    }

    const [newLibraryItem] = await db
      .insert(library)
      .values(libraryItem)
      .returning();
    return newLibraryItem;
  }

  async hasAccess(userId: string, productId: number): Promise<boolean> {
    // STRICT: Only grant access if BOTH conditions are met:
    // 1. User has library access granted
    // 2. User has completed payment for this product
    const [access] = await db
      .select()
      .from(library)
      .innerJoin(payments, and(
        eq(payments.userId, library.userId),
        eq(payments.productId, library.productId),
        eq(payments.status, 'completed')
      ))
      .where(and(
        eq(library.userId, userId),
        eq(library.productId, productId),
        eq(library.accessGranted, true)
      ));
    return !!access;
  }

  // Live metrics operations
  async getLiveMetrics(productId: number): Promise<LiveMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(liveMetrics)
      .where(eq(liveMetrics.productId, productId));
    return metrics;
  }

  async updateLiveMetrics(productId: number, metrics: Partial<InsertLiveMetrics>): Promise<LiveMetrics> {
    const [updatedMetrics] = await db
      .insert(liveMetrics)
      .values({ productId, ...metrics, lastUpdated: new Date() })
      .onConflictDoUpdate({
        target: liveMetrics.productId,
        set: { ...metrics, lastUpdated: new Date() }
      })
      .returning();
    return updatedMetrics;
  }

  // Order tracking and shipping operations
  async updateOrderStatus(orderId: number, status: string, trackingData?: any): Promise<Order> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (trackingData) {
      if (trackingData.trackingNumber) updateData.trackingNumber = trackingData.trackingNumber;
      if (trackingData.carrier) updateData.shippingCarrier = trackingData.carrier;
      if (trackingData.estimatedDelivery) updateData.estimatedDelivery = trackingData.estimatedDelivery;
      if (trackingData.trackingUrl) updateData.trackingUrl = trackingData.trackingUrl;
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  async getOrderWithTracking(orderId: number): Promise<Order & { tracking?: any[] } | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return undefined;

    const tracking = await this.getTrackingHistory(orderId);
    return { ...order, tracking };
  }

  async addTrackingEvent(orderId: number, trackingData: any): Promise<any> {
    const trackingEvent = {
      orderId,
      trackingNumber: trackingData.trackingNumber,
      carrier: trackingData.carrier,
      status: trackingData.status,
      location: trackingData.location,
      description: trackingData.description,
      eventTime: trackingData.eventTime || new Date(),
      estimatedDelivery: trackingData.estimatedDelivery,
    };

    const [newEvent] = await db
      .insert(shipmentTracking)
      .values(trackingEvent)
      .returning();
    return newEvent;
  }

  async getTrackingHistory(orderId: number): Promise<any[]> {
    return await db
      .select()
      .from(shipmentTracking)
      .where(eq(shipmentTracking.orderId, orderId))
      .orderBy(desc(shipmentTracking.eventTime));
  }

  generateTrackingNumber(): string {
    const prefix = 'CZ'; // CuponZone prefix
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const result = await db.select().from(payments).where(eq(payments.userId, userId));
      return result;
    } catch (error) {
      console.error(`Error fetching user payments for ${userId}:`, error);
      throw error;
    }
  }

  // Marketing campaigns operations
  async getMarketingCampaigns(): Promise<any[]> {
    try {
      const result = await db.query.marketingPush.findMany({
        orderBy: (marketingPush, { desc }) => [desc(marketingPush.createdAt)]
      });
      return result;
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      throw error;
    }
  }

  async createMarketingCampaign(campaign: any): Promise<any> {
    try {
      const [result] = await db.insert(marketingPush).values(campaign).returning();
      return result;
    } catch (error) {
      console.error("Error creating marketing campaign:", error);
      throw error;
    }
  }

  async deleteMarketingCampaign(id: number): Promise<void> {
    try {
      await db.delete(marketingPush).where(eq(marketingPush.id, id));
    } catch (error) {
      console.error("Error deleting marketing campaign:", error);
      throw error;
    }
  }

  async getActiveBanners(): Promise<any[]> {
    try {
      const result = await db.query.marketingPush.findMany({
        where: (marketingPush, { eq, and }) => 
          and(eq(marketingPush.isActive, true), eq(marketingPush.isBanner, true)),
        orderBy: (marketingPush, { desc }) => [desc(marketingPush.priority)]
      });
      return result;
    } catch (error) {
      console.error("Error fetching active banners:", error);
      throw error;
    }
  }

  // Front page media operations
  async getFrontPageMedia(): Promise<any[]> {
    try {
      const result = await db.query.frontPageMedia.findMany({
        where: (frontPageMedia, { eq }) => eq(frontPageMedia.isActive, true),
        orderBy: (frontPageMedia, { asc }) => [asc(frontPageMedia.position)]
      });
      return result;
    } catch (error) {
      console.error("Error fetching front page media:", error);
      throw error;
    }
  }

  async createFrontPageMedia(media: any): Promise<any> {
    try {
      const [result] = await db.insert(frontPageMedia).values(media).returning();
      return result;
    } catch (error) {
      console.error("Error creating front page media:", error);
      throw error;
    }
  }

  async updateFrontPageMedia(id: number, media: any): Promise<any> {
    try {
      const [result] = await db.update(frontPageMedia)
        .set({ ...media, updatedAt: new Date() })
        .where(eq(frontPageMedia.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating front page media:", error);
      throw error;
    }
  }

  async deleteFrontPageMedia(id: number): Promise<void> {
    try {
      await db.delete(frontPageMedia).where(eq(frontPageMedia.id, id));
    } catch (error) {
      console.error("Error deleting front page media:", error);
      throw error;
    }
  }

  // FOMO timers operations
  async getFomoTimers(): Promise<any[]> {
    try {
      const result = await db.query.fomoTimers.findMany({
        where: (fomoTimers, { eq }) => eq(fomoTimers.isActive, true),
        orderBy: (fomoTimers, { desc }) => [desc(fomoTimers.createdAt)]
      });
      return result;
    } catch (error) {
      console.error("Error fetching FOMO timers:", error);
      throw error;
    }
  }

  async createFomoTimer(timer: any): Promise<any> {
    try {
      const [result] = await db.insert(fomoTimers).values(timer).returning();
      return result;
    } catch (error) {
      console.error("Error creating FOMO timer:", error);
      throw error;
    }
  }

  async updateFomoTimer(id: number, timer: any): Promise<any> {
    try {
      const [result] = await db.update(fomoTimers)
        .set(timer)
        .where(eq(fomoTimers.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating FOMO timer:", error);
      throw error;
    }
  }

  async resetFomoTimer(id: number): Promise<any> {
    try {
      const now = new Date();
      const [timer] = await db.select().from(fomoTimers).where(eq(fomoTimers.id, id));
      
      if (timer) {
        const resetHours = timer.resetAfterHours || 7;
        const newEndTime = new Date(now.getTime() + (resetHours * 60 * 60 * 1000));
        
        const [result] = await db.update(fomoTimers)
          .set({
            startTime: now,
            endTime: newEndTime,
            lastReset: now
          })
          .where(eq(fomoTimers.id, id))
          .returning();
        return result;
      }
    } catch (error) {
      console.error("Error resetting FOMO timer:", error);
      throw error;
    }
  }

  // Product images operations
  async getProductImages(productId: number): Promise<ProductImage[]> {
    try {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(productImages.displayOrder, productImages.createdAt);
      return images;
    } catch (error) {
      console.error("Error fetching product images:", error);
      throw error;
    }
  }

  async addProductImage(image: InsertProductImage): Promise<ProductImage> {
    try {
      const [newImage] = await db
        .insert(productImages)
        .values(image)
        .returning();
      return newImage;
    } catch (error) {
      console.error("Error adding product image:", error);
      throw error;
    }
  }

  async updateProductImage(id: number, image: Partial<InsertProductImage>): Promise<ProductImage> {
    try {
      const [updatedImage] = await db
        .update(productImages)
        .set(image)
        .where(eq(productImages.id, id))
        .returning();
      return updatedImage;
    } catch (error) {
      console.error("Error updating product image:", error);
      throw error;
    }
  }

  async deleteProductImage(id: number): Promise<void> {
    try {
      await db
        .delete(productImages)
        .where(eq(productImages.id, id));
    } catch (error) {
      console.error("Error deleting product image:", error);
      throw error;
    }
  }

  async setPrimaryImage(productId: number, imageId: number): Promise<void> {
    try {
      // First, unset all other images as primary for this product
      await db
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, productId));

      // Then set the specified image as primary
      await db
        .update(productImages)
        .set({ isPrimary: true })
        .where(and(
          eq(productImages.id, imageId),
          eq(productImages.productId, productId)
        ));
    } catch (error) {
      console.error("Error setting primary image:", error);
      throw error;
    }
  }

  async getAllProductImagesWithDetails(): Promise<any[]> {
    try {
      const results = await db
        .select({
          id: productImages.id,
          productId: productImages.productId,
          productName: products.name,
          productBrand: products.brand,
          imageUrl: productImages.imageUrl,
          altText: productImages.altText,
          displayOrder: productImages.displayOrder,
          isPrimary: productImages.isPrimary,
          createdAt: productImages.createdAt,
        })
        .from(productImages)
        .leftJoin(products, eq(productImages.productId, products.id))
        .orderBy(productImages.createdAt);
      
      return results.map(row => ({
        ...row,
        usableUrl: row.imageUrl && row.imageUrl.startsWith('data:image') 
          ? `/api/images/${new Date(row.createdAt).getTime()}_image.jpg`
          : row.imageUrl
      }));
    } catch (error) {
      console.error("Error fetching all product images with details:", error);
      throw error;
    }
  }

  // Categories operations
  async getCategories(): Promise<Category[]> {
    try {
      const categoriesList = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(categories.name);
      return categoriesList;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [newCategory] = await db
        .insert(categories)
        .values(category)
        .returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    try {
      const [updatedCategory] = await db
        .update(categories)
        .set({ ...category, updatedAt: new Date() })
        .where(eq(categories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await db
        .update(categories)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(categories.id, id));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();