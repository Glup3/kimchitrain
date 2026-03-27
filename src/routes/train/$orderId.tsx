import { useState } from 'react'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronUp } from 'lucide-react'

import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { DishCard } from '#/components/DishCard'
import { OrderSummary } from '#/components/OrderSummary'

export const Route = createFileRoute('/train/$orderId')({
	component: OrderPage,
})

function OrderPage() {
	const { orderId } = Route.useParams()
	const zero = useZero()
	const [dishes] = useQuery(queries.dishes())
	const [dishGroups] = useQuery(queries.dishGroups())
	const [orders] = useQuery(queries.orders())
	const [orderItems] = useQuery(queries.orderItems())
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

	const groupMap = new Map(dishGroups.map((g) => [g.id, g.name]))
	const grouped = dishes.reduce<Map<number, typeof dishes>>((acc, d) => {
		const list = acc.get(d.groupId) ?? []
		list.push(d)
		acc.set(d.groupId, list)
		return acc
	}, new Map())

	const order = orders.find((o) => o.id === orderId)
	const currentOrderItems = orderItems.filter(
		(item) => item.orderId === orderId,
	)
	const totalCents = currentOrderItems.reduce(
		(sum, item) => sum + item.priceCents,
		0,
	)

	function handleAddDish(dishId: number, priceCents: number) {
		zero.mutate(
			mutators.orderItems.add({
				dishId,
				orderId,
				priceCents,
			}),
		)
	}

	function handleRemoveItem(id: string) {
		zero.mutate(mutators.orderItems.remove({ id }))
	}

	function handleUpdateOrderer(id: string, orderer: string) {
		zero.mutate(mutators.orderItems.updateOrderer({ id, orderer }))
	}

	const summaryProps = {
		items: currentOrderItems,
		dishes,
		onRemoveItem: handleRemoveItem,
		onUpdateOrderer: handleUpdateOrderer,
	}

	if (!order) {
		return (
			<div className="page-wrap py-8">
				<Link
					to="/"
					className="flex items-center gap-1.5 text-sm text-[var(--lagoon-deep)] no-underline"
				>
					<ArrowLeft size={16} />
					Back to orders
				</Link>
				<p className="text-base text-[var(--sea-ink-soft)] mt-4">
					Order not found
				</p>
			</div>
		)
	}

	return (
		<>
			<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
				<div className="page-wrap flex items-center gap-3 h-14">
					<Link
						to="/"
						className="flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
					>
						<ArrowLeft size={16} />
						Orders
					</Link>
					<span className="text-[var(--line)]">/</span>
					<span className="text-sm font-medium text-[var(--sea-ink)]">
						Order {orderId.slice(-5)}
					</span>
				</div>
			</nav>

			<div className="page-wrap py-8 pb-28 lg:pb-8">
				<div className="flex flex-col lg:flex-row gap-8">
					<section className="flex-1 min-w-0 self-start">
						{[...grouped.entries()].map(([groupId, groupDishes]) => (
							<div key={groupId} className="mb-6">
								<h2 className="island-kicker mb-2">
									{groupMap.get(groupId) ?? 'Other'}
								</h2>
								<div className="divide-y divide-[var(--line)]">
									{groupDishes.map((dish) => (
										<DishCard
											key={dish.id}
											dish={dish}
											onAdd={() =>
												handleAddDish(dish.id, dish.priceCents)
											}
										/>
									))}
								</div>
							</div>
						))}
					</section>

					<aside className="hidden lg:block w-80 shrink-0">
						<div className="sticky top-20">
							<OrderSummary {...summaryProps} />
						</div>
					</aside>
				</div>

				{currentOrderItems.length > 0 && (
					<div className="lg:hidden fixed bottom-0 inset-x-0 z-50 mobile-summary-bar">
						{mobileSheetOpen && (
							<div className="max-h-[55vh] overflow-y-auto rounded-t-xl">
								<OrderSummary {...summaryProps} />
							</div>
						)}
						<button
							type="button"
							onClick={() => setMobileSheetOpen((v) => !v)}
							className="w-full flex items-center justify-between px-5 py-3 island-shell border-t border-[var(--line)] rounded-none"
						>
							<span className="text-sm font-medium text-[var(--sea-ink)]">
								{currentOrderItems.length}{' '}
								{currentOrderItems.length === 1 ? 'item' : 'items'}
							</span>
							<div className="flex items-center gap-3">
								<span className="text-sm font-bold text-[var(--palm)] tabular-nums">
									${(totalCents / 100).toFixed(2)}
								</span>
								<ChevronUp
									size={18}
									className={`text-[var(--sea-ink-soft)] transition-transform ${mobileSheetOpen ? 'rotate-180' : ''}`}
								/>
							</div>
						</button>
					</div>
				)}
			</div>
		</>
	)
}
