import { eq } from 'drizzle-orm'

import { db } from '#/db'

import type { OrderSummaryVideoProps } from './OrderSummaryVideo'

export interface OrderSummaryVideoOverrides {
	title?: string
}

export async function getOrderSummaryVideoProps(
	orderId: string,
	overrides: OrderSummaryVideoOverrides = {},
): Promise<OrderSummaryVideoProps> {
	const order = await db.query.orders.findFirst({
		where: (orders) => eq(orders.id, orderId),
		with: {
			items: {
				with: {
					dish: true,
				},
			},
		},
	})

	if (!order) {
		throw new Error(`Order ${orderId} not found`)
	}

	const orderers = new Map<string, { name: string; items: string[]; totalCents: number }>()

	for (const item of order.items) {
		const name = item.orderer.trim() || 'Unassigned'
		const entry = orderers.get(name) ?? {
			name,
			items: [],
			totalCents: 0,
		}

		entry.items.push(item.dish?.name ?? 'Unknown item')
		entry.totalCents += item.priceCents
		orderers.set(name, entry)
	}

	const sortedOrderers = [...orderers.values()]
		.map((orderer) => ({
			...orderer,
			items: orderer.items.sort((a, b) => a.localeCompare(b)),
		}))
		.sort((a, b) => b.totalCents - a.totalCents || a.name.localeCompare(b.name))

	return {
		title: overrides.title ?? 'Kimchi Train',
		totalCents: order.items.reduce((sum, item) => sum + item.priceCents, 0),
		orderers: sortedOrderers,
	}
}
