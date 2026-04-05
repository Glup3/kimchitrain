import { and, eq, inArray, lt, notExists } from 'drizzle-orm'
import { defineTask } from 'nitro/task'

import { db } from '#/db'
import { orderItems, orders } from '#/db/schema'

const CUTOFF_TIME_IN_MS = 45 * 60 * 1000

export default defineTask({
	meta: {
		name: 'orders:cleanup-empty',
		description: 'Deletes uncompleted empty orders older than 30 minutes',
	},
	run: async (event) => {
		const staleOrders = await db
			.select({ id: orders.id })
			.from(orders)
			.where(
				and(
					eq(orders.completed, false),
					lt(orders.createdAt, new Date(Date.now() - CUTOFF_TIME_IN_MS)),
					notExists(db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.orderId, orders.id))),
				),
			)

		if (staleOrders.length === 0) {
			return { result: 'Skipped' }
		}

		console.log(`[tasks] ${event.name} found ${staleOrders.length} stale empty uncompleted orders`)
		await db.delete(orders).where(
			inArray(
				orders.id,
				staleOrders.map((order) => order.id),
			),
		)

		return { result: 'Success' }
	},
})
