import { useQuery } from '@rocicorp/zero/react'

import { queries } from '#/lib/queries'

import { BusiestDayChart } from './BusiestDayChart'
import { CategoryBreakdownChart } from './CategoryBreakdownChart'
import { OrderSizeChart } from './OrderSizeChart'
import { PriceRangeChart } from './PriceRangeChart'
import { SpendingChart } from './SpendingChart'
import { SummaryCards } from './SummaryCards'
import { TopDishesChart } from './TopDishesChart'

function median(sorted: number[]): number {
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function AnalyticsSection() {
	const [orders, result] = useQuery(queries.orders.withItemsDishesAndGroups())
	const [allDishes] = useQuery(queries.dishes.all())

	if (orders.length === 0) {
		if (result.type !== 'complete') return null
		return <p className="py-16 text-center text-sm text-[var(--sea-ink-soft)]">No orders yet</p>
	}

	const allItems = orders.flatMap((o) => o.items)
	const totalOrders = orders.length
	const totalSpendingCents = allItems.reduce((s, i) => s + i.priceCents, 0)
	const avgOrderCents = totalOrders > 0 ? totalSpendingCents / totalOrders : 0
	const totalItems = allItems.length
	const completedOrders = orders.filter((o) => o.completed).length
	const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

	const orderTotals = orders.map((o) => o.items.reduce((s, i) => s + i.priceCents, 0)).sort((a, b) => a - b)
	const biggestOrderCents = orderTotals.length > 0 ? orderTotals[orderTotals.length - 1] : 0
	const medianOrderCents = median(orderTotals)

	const orderedDishIds = new Set(allItems.map((i) => i.dishId))
	const totalMenuDishes = allDishes.length
	const dishVariety = totalMenuDishes > 0 ? (orderedDishIds.size / totalMenuDishes) * 100 : 0

	const dishCounts = new Map<number, { name: string; count: number; cost: number }>()
	for (const item of allItems) {
		const existing = dishCounts.get(item.dishId)
		if (existing) {
			existing.count++
			existing.cost += item.priceCents
		} else {
			dishCounts.set(item.dishId, {
				name: item.dish?.name ?? 'Unknown',
				count: 1,
				cost: item.priceCents,
			})
		}
	}
	const topDishes = [...dishCounts.values()].sort((a, b) => b.count - a.count).slice(0, 8)

	const spendingByDate = new Map<string, number>()
	for (const order of orders) {
		if (order.createdAt != null) {
			const d = new Date(order.createdAt)
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
			const orderTotal = order.items.reduce((s, i) => s + i.priceCents, 0)
			spendingByDate.set(key, (spendingByDate.get(key) ?? 0) + orderTotal)
		}
	}
	const spendingData = [...spendingByDate.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, cents]) => ({
			date,
			spending: +(cents / 100).toFixed(2),
			label: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
		}))

	const categoryMap = new Map<string, number>()
	for (const item of allItems) {
		const groupName = item.dish?.group?.name ?? 'Other'
		categoryMap.set(groupName, (categoryMap.get(groupName) ?? 0) + item.priceCents)
	}
	const categoryData = [...categoryMap.entries()]
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value)

	const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	const dayBuckets = new Map<number, number>()
	for (const order of orders) {
		if (order.createdAt != null) {
			const dow = new Date(order.createdAt).getDay()
			dayBuckets.set(dow, (dayBuckets.get(dow) ?? 0) + 1)
		}
	}
	const busiestDayData = DAY_LABELS.map((day, i) => ({ day, orders: dayBuckets.get(i) ?? 0 }))

	const sizeBuckets = new Map<number, number>()
	for (const order of orders) {
		const size = order.items.length
		sizeBuckets.set(size, (sizeBuckets.get(size) ?? 0) + 1)
	}
	const maxSize = Math.max(...sizeBuckets.keys(), 0)
	const orderSizeData = Array.from({ length: maxSize }, (_, i) => ({
		size: String(i + 1),
		count: sizeBuckets.get(i + 1) ?? 0,
	}))
	if (sizeBuckets.size > 0) {
		const cap = maxSize + 1
		const overflow = [...sizeBuckets.entries()].filter(([s]) => s >= cap).reduce((sum, [, c]) => sum + c, 0)
		if (overflow > 0) {
			orderSizeData.push({ size: `${cap}+`, count: overflow })
		}
	}

	const priceBuckets = [
		{ label: '€0–5', min: 0, max: 500 },
		{ label: '€5–10', min: 500, max: 1000 },
		{ label: '€10–15', min: 1000, max: 1500 },
		{ label: '€15–20', min: 1500, max: 2000 },
		{ label: '€20+', min: 2000, max: Infinity },
	]
	const priceRangeData = priceBuckets.map((bucket) => {
		const count = allItems.filter((i) => {
			const p = i.dish?.priceCents ?? i.priceCents
			return p >= bucket.min && p < bucket.max
		}).length
		return { range: bucket.label, count }
	})

	return (
		<section className="space-y-5">
			<SummaryCards
				totalOrders={totalOrders}
				totalSpendingCents={totalSpendingCents}
				avgOrderCents={avgOrderCents}
				totalItems={totalItems}
				biggestOrderCents={biggestOrderCents}
				medianOrderCents={medianOrderCents}
				completionRate={completionRate}
				dishVariety={dishVariety}
			/>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{topDishes.length > 0 && <TopDishesChart data={topDishes} />}
				{spendingData.length > 0 && <SpendingChart data={spendingData} />}
				{categoryData.length > 0 && <CategoryBreakdownChart data={categoryData} />}
				{dayBuckets.size > 0 && <BusiestDayChart data={busiestDayData} />}
				{orderSizeData.length > 0 && <OrderSizeChart data={orderSizeData} />}
				{allItems.length > 0 && <PriceRangeChart data={priceRangeData} />}
			</div>
		</section>
	)
}
