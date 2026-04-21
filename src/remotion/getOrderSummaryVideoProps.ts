import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { formatOrderDate } from '#/lib/format'

import type { OrderSummaryVideoProps } from './OrderSummaryVideo'

interface OrderSummaryAnimationOverrides {
	introFrames?: number
	itemStaggerFrames?: number
	personStaggerFrames?: number
	highlightPerson?: string
	showSettled?: boolean
}

interface OrderSummaryThemeOverrides {
	background?: string
	surface?: string
	accent?: string
	accentSecondary?: string
	foreground?: string
	muted?: string
}

export interface OrderSummaryVideoOverrides {
	title?: string
	animation?: OrderSummaryAnimationOverrides
	theme?: OrderSummaryThemeOverrides
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

	const groupedMap = new Map<string, { name: string; qty: number; lineTotal: number; orderers: string[] }>()
	const peopleMap = new Map<string, { name: string; totalCents: number; settledCents: number; itemCount: number }>()

	for (const item of order.items) {
		const dishName = item.dish?.name ?? 'Unknown'
		const groupedEntry = groupedMap.get(dishName) ?? { name: dishName, qty: 0, lineTotal: 0, orderers: [] as string[] }
		groupedEntry.qty += 1
		groupedEntry.lineTotal += item.priceCents
		groupedEntry.orderers.push(item.orderer.trim() || 'Unassigned')
		groupedMap.set(dishName, groupedEntry)

		const personName = item.orderer.trim() || 'Unassigned'
		const personEntry = peopleMap.get(personName) ?? {
			name: personName,
			totalCents: 0,
			settledCents: 0,
			itemCount: 0,
		}
		personEntry.totalCents += item.priceCents
		personEntry.itemCount += 1
		if (item.settled) {
			personEntry.settledCents += item.priceCents
		}
		peopleMap.set(personName, personEntry)
	}

	const groupedItems = [...groupedMap.values()].sort(
		(a, b) => b.lineTotal - a.lineTotal || a.name.localeCompare(b.name),
	)
	const people = [...peopleMap.values()].sort((a, b) => b.totalCents - a.totalCents || a.name.localeCompare(b.name))
	const totalCents = order.items.reduce((sum, item) => sum + item.priceCents, 0)
	const outstandingCents = order.items.reduce((sum, item) => sum + (item.settled ? 0 : item.priceCents), 0)
	const createdAtTime = order.createdAt instanceof Date ? order.createdAt.getTime() : Date.now()

	return {
		title: overrides.title ?? 'Order summary',
		order: {
			id: order.id,
			createdAtLabel: formatOrderDate(createdAtTime),
			totalCents,
			outstandingCents,
			completed: order.completed,
			itemCount: order.items.length,
			groupedItems,
			people,
		},
		animation: {
			introFrames: overrides.animation?.introFrames ?? 24,
			itemStaggerFrames: overrides.animation?.itemStaggerFrames ?? 6,
			personStaggerFrames: overrides.animation?.personStaggerFrames ?? 8,
			highlightPerson: overrides.animation?.highlightPerson,
			showSettled: overrides.animation?.showSettled ?? true,
		},
		theme: {
			background: overrides.theme?.background ?? '#07131f',
			surface: overrides.theme?.surface ?? 'rgba(11, 24, 38, 0.76)',
			accent: overrides.theme?.accent ?? '#4fb8b2',
			accentSecondary: overrides.theme?.accentSecondary ?? '#7bf1a8',
			foreground: overrides.theme?.foreground ?? '#f4fbff',
			muted: overrides.theme?.muted ?? 'rgba(244, 251, 255, 0.65)',
		},
	}
}
