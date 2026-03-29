import { useQuery } from '@rocicorp/zero/react'

import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'

import { SpendingChart } from './SpendingChart'
import { SummaryCards } from './SummaryCards'
import { TopDishesChart } from './TopDishesChart'

export function AnalyticsSection() {
	const [orders, result] = useQuery(queries.orders.withItemsAndDishes())

	if (orders.length === 0) {
		if (result.type !== 'complete') return null
		return (
			<p className="py-16 text-center text-sm text-[var(--sea-ink-soft)]">No orders yet</p>
		)
	}

	const totalOrders = orders.length
	const allItems = orders.flatMap((o) => o.items)
	const totalSpendingCents = allItems.reduce((s, i) => s + i.priceCents, 0)
	const avgOrderCents = totalOrders > 0 ? totalSpendingCents / totalOrders : 0
	const totalItems = allItems.length

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

	const hasTopDishes = topDishes.length > 0
	const hasSpending = spendingData.length > 0
	const bothCharts = hasTopDishes && hasSpending

	return (
		<section className="mb-10 space-y-5">
			<SummaryCards
				totalOrders={totalOrders}
				totalSpendingCents={totalSpendingCents}
				avgOrderCents={avgOrderCents}
				totalItems={totalItems}
			/>
			{(hasTopDishes || hasSpending) && (
				<div className={cn('grid items-start gap-5', bothCharts ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')}>
					{hasTopDishes && <TopDishesChart data={topDishes} />}
					{hasSpending && <SpendingChart data={spendingData} />}
				</div>
			)}
		</section>
	)
}
