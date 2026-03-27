import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// no default values, should be handled in zero mutations https://bugs.rocicorp.dev/p/zero/issue/3465

export const dishes = pgTable('dishes', {
	id: integer().primaryKey(),
	name: text().notNull(),
})

export const dishesRelations = relations(dishes, ({ many }) => ({
	orderItems: many(orderItems),
}))

export const orders = pgTable('orders', {
	id: varchar({ length: 26 }).primaryKey(),
	createdAt: timestamp('created_at'),
})

export const ordersRelations = relations(orders, ({ many }) => ({
	items: many(orderItems),
}))

export const orderItems = pgTable('order_items', {
	id: varchar({ length: 26 }).primaryKey(),
	orderer: text().notNull(),
	priceCents: integer('price_cents').notNull(),
	dishId: integer('dish_id')
		.notNull()
		.references(() => dishes.id),
	orderId: varchar({ length: 26 })
		.notNull()
		.references(() => orders.id),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	dish: one(dishes, {
		fields: [orderItems.dishId],
		references: [dishes.id],
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
}))
