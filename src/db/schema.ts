import { relations, sql } from 'drizzle-orm'
import { boolean, check, integer, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

// no default values, should be handled in zero mutations https://bugs.rocicorp.dev/p/zero/issue/3465

export const dishGroups = pgTable('dish_groups', {
	id: integer().primaryKey(),
	name: text().notNull(),
})

export const dishes = pgTable('dishes', {
	id: integer().primaryKey(),
	name: text().notNull(),
	priceCents: integer('price_cents').notNull(),
	description: text().notNull(),
	isPopular: boolean('is_popular').notNull(),
	groupId: integer('group_id')
		.notNull()
		.references(() => dishGroups.id),
})

export const dishPriceHistory = pgTable(
	'dish_price_history',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		dishId: integer('dish_id')
			.notNull()
			.references(() => dishes.id),
		priceCents: integer('price_cents').notNull(),
		effectiveFrom: timestamp('effective_from', { withTimezone: true }),
		recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
		source: text().notNull(),
		isBaseline: boolean('is_baseline').notNull(),
	},
	(table) => [
		check('dish_price_history_nonnegative', sql`${table.priceCents} >= 0`),
		uniqueIndex('dish_price_history_baseline')
			.on(table.dishId)
			.where(sql`${table.isBaseline}`),
	],
)

export const dishesRelations = relations(dishes, ({ one, many }) => ({
	orderItems: many(orderItems),
	group: one(dishGroups, {
		fields: [dishes.groupId],
		references: [dishGroups.id],
	}),
}))

export const orders = pgTable('orders', {
	id: varchar({ length: 26 }).primaryKey(),
	completed: boolean().notNull(),
	createdAt: timestamp('created_at'),
})

export const ordersRelations = relations(orders, ({ many }) => ({
	items: many(orderItems),
}))

export const orderItems = pgTable('order_items', {
	id: varchar({ length: 26 }).primaryKey(),
	orderer: text().notNull(),
	priceCents: integer('price_cents').notNull(),
	settled: boolean().notNull(),
	dishId: integer('dish_id')
		.notNull()
		.references(() => dishes.id),
	orderId: varchar('order_id', { length: 26 })
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
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
