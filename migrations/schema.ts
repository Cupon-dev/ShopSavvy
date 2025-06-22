import { pgTable, foreignKey, serial, varchar, integer, timestamp, index, jsonb, unique, numeric, text, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const cartItems = pgTable("cart_items", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	productId: integer("product_id").notNull(),
	quantity: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cart_items_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cart_items_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	name: varchar(),
	phone: varchar(),
	signUpTime: timestamp("sign_up_time", { mode: 'string' }).defaultNow(),
	instagramLink: varchar("instagram_link"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	trackingNumber: varchar("tracking_number"),
	shippingCarrier: varchar("shipping_carrier"),
	estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
	shippedAt: timestamp("shipped_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	shippingAddress: jsonb("shipping_address"),
	trackingUrl: varchar("tracking_url"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const shipmentTracking = pgTable("shipment_tracking", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	trackingNumber: varchar("tracking_number").notNull(),
	carrier: varchar().notNull(),
	status: varchar().notNull(),
	location: varchar(),
	description: text(),
	eventTime: timestamp("event_time", { mode: 'string' }).notNull(),
	estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "shipment_tracking_order_id_fkey"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	brand: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	category: text().notNull(),
	imageUrl: text("image_url").notNull(),
	rating: numeric({ precision: 2, scale:  1 }).default('0'),
	reviewCount: integer("review_count").default(0),
	viewCount: integer("view_count").default(0),
	soldCount: integer("sold_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	demoLink: text("demo_link"),
	accessLink: text("access_link"),
	razorpayLink: text("razorpay_link"),
	inStock: boolean("in_stock").default(true).notNull(),
	isHighDemand: boolean("is_high_demand").default(false).notNull(),
	hasInstantAccess: boolean("has_instant_access").default(true).notNull(),
});

export const marketingPush = pgTable("marketing_push", {
	id: serial().primaryKey().notNull(),
	pushId: varchar("push_id").notNull(),
	userId: varchar("user_id"),
	offerTitle: varchar("offer_title").notNull(),
	description: text(),
	scheduledTime: timestamp("scheduled_time", { mode: 'string' }),
	status: text().default('queued').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	bannerImage: text("banner_image"),
	discountPercentage: integer("discount_percentage"),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	buttonAction: varchar("button_action", { length: 255 }),
	isBanner: boolean("is_banner").default(false),
	priority: integer().default(0),
	targetCategory: varchar("target_category", { length: 100 }),
	buttonText: varchar("button_text", { length: 100 }).default('BUY NOW'),
	isActive: boolean("is_active").default(true),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "marketing_push_user_id_fkey"
		}).onDelete("cascade"),
	unique("marketing_push_push_id_key").on(table.pushId),
]);

export const frontPageMedia = pgTable("front_page_media", {
	id: serial().primaryKey().notNull(),
	title: varchar().notNull(),
	description: text(),
	imageUrl: text("image_url").notNull(),
	videoUrl: text("video_url"),
	mediaType: varchar("media_type").notNull(),
	position: integer().default(0),
	isActive: boolean("is_active").default(true),
	clickAction: text("click_action"),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow(),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const fomoTimers = pgTable("fomo_timers", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	title: varchar().notNull(),
	description: text(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	timezone: varchar().default('Asia/Kolkata'),
	isActive: boolean("is_active").default(true),
	resetAfterHours: integer("reset_after_hours").default(7),
	lastReset: timestamp("last_reset", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const favorites = pgTable("favorites", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	productId: integer("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "favorites_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "favorites_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	productId: integer("product_id").notNull(),
	quantity: integer().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const library = pgTable("library", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	productId: integer("product_id").notNull(),
	accessGranted: boolean("access_granted").default(true),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "library_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "library_product_id_products_id_fk"
		}),
]);

export const liveMetrics = pgTable("live_metrics", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	currentViewers: integer("current_viewers").default(0),
	totalSold: integer("total_sold").default(0),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "live_metrics_product_id_products_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	productId: integer("product_id").notNull(),
	razorpayLinkUsed: text("razorpay_link_used"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: text().default('pending').notNull(),
	paymentMethod: text("payment_method"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	paymentId: varchar("payment_id"),
	dateTime: timestamp("date_time", { mode: 'string' }).defaultNow(),
	issueNotes: text("issue_notes"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "payments_product_id_products_id_fk"
		}),
	unique("payments_payment_id_key").on(table.paymentId),
]);

export const productImages = pgTable("product_images", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	imageUrl: text("image_url").notNull(),
	altText: text("alt_text"),
	displayOrder: integer("display_order").default(0),
	isPrimary: boolean("is_primary").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_images_product_id_fkey"
		}),
]);
