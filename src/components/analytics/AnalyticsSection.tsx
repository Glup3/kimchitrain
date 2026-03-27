import { useQuery } from '@rocicorp/zero/react'

import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'

import { RevenueChart } from './RevenueChart'
import { SummaryCards } from './SummaryCards'
import { TopDishesChart } from './TopDishesChart'

export function AnalyticsSection() {
	const [orders] = useQuery(queries.orders.all())
	const [orderItems] = useQuery(queries.orderItems.all())
	const [dishes] = useQuery(queries.dishes.all())

	const totalOrders = orders.length
	if (totalOrders === 0) return null

	const totalRevenueCents = orderItems.reduce((s, i) => s + i.priceCents, 0)
	const avgOrderCents = totalOrders > 0 ? totalRevenueCents / totalOrders : 0
	const completedOrders = orders.filter((o) => o.completed).length
	const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

	const dishMap = new Map(dishes.map((d) => [d.id, d]))
	const dishCounts = new Map<number, { name: string; count: number; revenue: number }>()
	for (const item of orderItems) {
		const existing = dishCounts.get(item.dishId)
		if (existing) {
			existing.count++
			existing.revenue += item.priceCents
		} else {
			const dish = dishMap.get(item.dishId)
			dishCounts.set(item.dishId, {
				name: dish?.name ?? 'Unknown',
				count: 1,
				revenue: item.priceCents,
			})
		}
	}
	const topDishes = [...dishCounts.values()].sort((a, b) => b.count - a.count).slice(0, 8)

	const orderTotals = new Map<string, number>()
	for (const item of orderItems) {
		orderTotals.set(item.orderId, (orderTotals.get(item.orderId) ?? 0) + item.priceCents)
	}
	const revenueByDate = new Map<string, number>()
	for (const order of orders) {
		if (order.createdAt != null) {
			const d = new Date(order.createdAt)
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
			revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + (orderTotals.get(order.id) ?? 0))
		}
	}
	const revenueData = [...revenueByDate.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, cents]) => ({
			date,
			revenue: +(cents / 100).toFixed(2),
			label: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
		}))

	const hasTopDishes = topDishes.length > 0
	const hasRevenue = revenueData.length > 0
	const bothCharts = hasTopDishes && hasRevenue

	return (
		<section className="mb-10 space-y-5">
			<SummaryCards
				totalOrders={totalOrders}
				totalRevenueCents={totalRevenueCents}
				avgOrderCents={avgOrderCents}
				completionRate={completionRate}
			/>
			{(hasTopDishes || hasRevenue) && (
				<div className={cn('grid items-start gap-5', bothCharts ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')}>
					{hasTopDishes && <TopDishesChart data={topDishes} />}
					{hasRevenue && <RevenueChart data={revenueData} />}
				</div>
			)}
		</section>
	)
}
