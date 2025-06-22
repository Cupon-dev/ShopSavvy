import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // UserID - Unique user identifier
  name: varchar("name"), // Full name (combining firstName and lastName)
  email: varchar("email").unique(), // Email address
  phone: varchar("phone"), // Contact number
  firstName: varchar("first_name"), // Keep for backward compatibility
  lastName: varchar("last_name"), // Keep for backward compatibility
  profileImageUrl: varchar("profile_image_url"),
  instagramLink: varchar("instagram_link"), // Instagram profile link
  signUpTime: timestamp("sign_up_time").defaultNow(), // When the user registered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  demoLink: text("demo_link"),
  accessLink: text("access_link"),
  razorpayLink: text("razorpay_link"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default('0'),
  reviewCount: integer("review_count").default(0),
  viewCount: integer("view_count").default(0),
  soldCount: integer("sold_count").default(0),
  inStock: boolean("in_stock").default(true),
  isHighDemand: boolean("is_high_demand").default(false),
  hasInstantAccess: boolean("has_instant_access").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, processing, shipped, out_for_delivery, delivered, cancelled
  trackingNumber: varchar("tracking_number"),
  shippingCarrier: varchar("shipping_carrier"), // fedex, ups, usps, dhl
  estimatedDelivery: timestamp("estimated_delivery"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  shippingAddress: jsonb("shipping_address"),
  trackingUrl: varchar("tracking_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment tracking table for Razorpay transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentId: varchar("payment_id").unique(), // Unique payment identifier
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  razorpayLinkUsed: text("razorpay_link_used"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dateTime: timestamp("date_time").defaultNow(),
  status: text("status").notNull().default("pending"), // Success, Failed, Pending
  paymentMethod: text("payment_method"), // UPI, Card, NetBanking
  issueNotes: text("issue_notes"), // Optional user-reported issues
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing campaigns and banners table
export const marketingPush = pgTable("marketing_push", {
  id: serial("id").primaryKey(),
  pushId: varchar("push_id").unique().notNull(), // Unique ID for each push/offer
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Target user (if specific)
  offerTitle: varchar("offer_title").notNull(), // Title of the campaign
  description: text("description"), // Campaign content
  bannerImage: text("banner_image"), // Banner image URL
  discountPercentage: integer("discount_percentage"), // Discount percentage
  validUntil: timestamp("valid_until"), // Offer expiry
  buttonText: varchar("button_text").default("BUY NOW"), // CTA button text
  buttonAction: varchar("button_action"), // URL or action to perform
  isActive: boolean("is_active").default(true), // Whether banner is active
  isBanner: boolean("is_banner").default(false), // True for banners, false for push notifications
  priority: integer("priority").default(0), // Priority for display order
  targetCategory: varchar("target_category"), // Product category to target
  scheduledTime: timestamp("scheduled_time"), // When to send
  status: text("status").notNull().default("queued"), // Sent, Queued, Failed
  createdAt: timestamp("created_at").defaultNow(),
});

// User library for purchased products access (no duplicates)
export const library = pgTable("library", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  accessGranted: boolean("access_granted").default(true),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserProduct: unique().on(table.userId, table.productId)
}));

// Images and media storage for front page
export const frontPageMedia = pgTable("front_page_media", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  mediaType: varchar("media_type").notNull(), // "banner", "hero", "promo", "game"
  position: integer("position").default(0), // Display order
  isActive: boolean("is_active").default(true),
  clickAction: text("click_action"), // URL or action when clicked
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FOMO timers and countdown
export const fomoTimers = pgTable("fomo_timers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // "flash_sale", "limited_offer"
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timezone: varchar("timezone").default("Asia/Kolkata"),
  isActive: boolean("is_active").default(true),
  resetAfterHours: integer("reset_after_hours").default(7), // Reset timer every 7 hours
  lastReset: timestamp("last_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories for product organization
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Icon name for UI
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live metrics for dynamic numbers
export const liveMetrics = pgTable("live_metrics", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  currentViewers: integer("current_viewers").default(0),
  totalSold: integer("total_sold").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Product images storage
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").default(0),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shipment tracking events table
export const shipmentTracking = pgTable("shipment_tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  trackingNumber: varchar("tracking_number").notNull(),
  carrier: varchar("carrier").notNull(), // fedex, ups, usps, dhl
  status: varchar("status").notNull(), // in_transit, out_for_delivery, delivered, exception
  location: varchar("location"),
  description: text("description"),
  eventTime: timestamp("event_time").notNull(),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  favorites: many(favorites),
  orders: many(orders),
  payments: many(payments),
  library: many(library),
  marketingPush: many(marketingPush),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  cartItems: many(cartItems),
  favorites: many(favorites),
  orderItems: many(orderItems),
  payments: many(payments),
  library: many(library),
  liveMetrics: many(liveMetrics),
  images: many(productImages),
  category: one(categories, {
    fields: [products.category],
    references: [categories.name],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [payments.productId],
    references: [products.id],
  }),
}));

export const libraryRelations = relations(library, ({ one }) => ({
  user: one(users, {
    fields: [library.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [library.productId],
    references: [products.id],
  }),
}));

export const liveMetricsRelations = relations(liveMetrics, ({ one }) => ({
  product: one(products, {
    fields: [liveMetrics.productId],
    references: [products.id],
  }),
}));

export const frontPageMediaRelations = relations(frontPageMedia, ({ }) => ({}));

export const fomoTimersRelations = relations(fomoTimers, ({ }) => ({}));

export const shipmentTrackingRelations = relations(shipmentTracking, ({ one }) => ({
  order: one(orders, {
    fields: [shipmentTracking.orderId],
    references: [orders.id],
  }),
}));

export const marketingPushRelations = relations(marketingPush, ({ one }) => ({
  user: one(users, {
    fields: [marketingPush.userId],
    references: [users.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLibrarySchema = createInsertSchema(library).omit({
  id: true,
  createdAt: true,
});

export const insertLiveMetricsSchema = createInsertSchema(liveMetrics).omit({
  id: true,
  lastUpdated: true,
});

export const insertMarketingPushSchema = createInsertSchema(marketingPush).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentTrackingSchema = createInsertSchema(shipmentTracking).omit({
  id: true,
  createdAt: true,
});

export const insertFrontPageMediaSchema = createInsertSchema(frontPageMedia).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFomoTimersSchema = createInsertSchema(fomoTimers).omit({
  id: true,
  createdAt: true,
  lastReset: true,
});

export const insertProductImagesSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
});

export const insertCategoriesSchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Library = typeof library.$inferSelect;
export type InsertLibrary = z.infer<typeof insertLibrarySchema>;
export type LiveMetrics = typeof liveMetrics.$inferSelect;
export type InsertLiveMetrics = z.infer<typeof insertLiveMetricsSchema>;
export type MarketingPush = typeof marketingPush.$inferSelect;
export type InsertMarketingPush = z.infer<typeof insertMarketingPushSchema>;
export type ShipmentTracking = typeof shipmentTracking.$inferSelect;
export type InsertShipmentTracking = z.infer<typeof insertShipmentTrackingSchema>;
export type FrontPageMedia = typeof frontPageMedia.$inferSelect;
export type InsertFrontPageMedia = z.infer<typeof insertFrontPageMediaSchema>;
export type FomoTimers = typeof fomoTimers.$inferSelect;
export type InsertFomoTimers = z.infer<typeof insertFomoTimersSchema>;
export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = z.infer<typeof insertProductImagesSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategoriesSchema>;
