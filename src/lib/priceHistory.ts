export interface PriceRecord {
	id: number
	dishId: number
	priceCents: number
	effectiveFrom: number | null
	recordedAt: number
	source: string
	isBaseline: boolean
}

export function percentageChange(initial: number, current: number): number | null {
	return initial > 0 ? ((current - initial) / initial) * 100 : null
}

/** Fixed basket of original dishes, using the timeline of recorded prices. */
export function buildBasket(history: readonly PriceRecord[]) {
	const sorted = [...history].sort((a, b) => a.recordedAt - b.recordedAt || a.id - b.id)
	const baseline = sorted.filter((entry) => entry.isBaseline)
	if (!baseline.length) return []
	const prices = new Map(baseline.map((entry) => [entry.dishId, entry.priceCents]))
	const start = Math.max(...baseline.map((entry) => entry.recordedAt))
	const total = () => [...prices.values()].reduce((sum, price) => sum + price, 0)
	const points = [{ timestamp: start, priceCents: total() }]
	for (const entry of sorted) {
		if (entry.isBaseline || entry.recordedAt < start || !prices.has(entry.dishId)) continue
		prices.set(entry.dishId, entry.priceCents)
		const point = { timestamp: entry.recordedAt, priceCents: total() }
		if (points.length > 1 && points.at(-1)!.timestamp === point.timestamp) points[points.length - 1] = point
		else points.push(point)
	}
	return points
}

export interface HistoricalOrder {
	createdAt: number | null
	items: readonly { dishId: number; priceCents: number }[]
}

/** Order dates are observations, never inferred menu effective dates. */
export function observedPrices(orders: readonly HistoricalOrder[], dishId: number) {
	const observations = new Map<string, { timestamp: number; priceCents: number }>()
	for (const order of orders) {
		if (order.createdAt === null) continue
		for (const item of order.items) {
			if (item.dishId !== dishId) continue
			const key = `${order.createdAt}:${item.priceCents}`
			observations.set(key, { timestamp: order.createdAt, priceCents: item.priceCents })
		}
	}
	return [...observations.values()].sort((a, b) => b.timestamp - a.timestamp || a.priceCents - b.priceCents)
}
