import { relations } from "drizzle-orm/relations";
import { users, cartItems, products, orders, shipmentTracking, marketingPush, favorites, orderItems, library, liveMetrics, payments, productImages } from "./schema";

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	user: one(users, {
		fields: [cartItems.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	cartItems: many(cartItems),
	orders: many(orders),
	marketingPushes: many(marketingPush),
	favorites: many(favorites),
	libraries: many(library),
	payments: many(payments),
}));

export const productsRelations = relations(products, ({many}) => ({
	cartItems: many(cartItems),
	favorites: many(favorites),
	orderItems: many(orderItems),
	libraries: many(library),
	liveMetrics: many(liveMetrics),
	payments: many(payments),
	productImages: many(productImages),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	shipmentTrackings: many(shipmentTracking),
	orderItems: many(orderItems),
}));

export const shipmentTrackingRelations = relations(shipmentTracking, ({one}) => ({
	order: one(orders, {
		fields: [shipmentTracking.orderId],
		references: [orders.id]
	}),
}));

export const marketingPushRelations = relations(marketingPush, ({one}) => ({
	user: one(users, {
		fields: [marketingPush.userId],
		references: [users.id]
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [favorites.productId],
		references: [products.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const libraryRelations = relations(library, ({one}) => ({
	user: one(users, {
		fields: [library.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [library.productId],
		references: [products.id]
	}),
}));

export const liveMetricsRelations = relations(liveMetrics, ({one}) => ({
	product: one(products, {
		fields: [liveMetrics.productId],
		references: [products.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [payments.productId],
		references: [products.id]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));