import { useEffect, useRef, useState } from 'react'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronUp } from 'lucide-react'

import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { DishCard } from '#/components/DishCard'
import { OrderSummary } from '#/components/OrderSummary'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const zero = useZero()
	const [dishes] = useQuery(queries.dishes())
	const [orders] = useQuery(queries.orders())
	const [orderItems] = useQuery(queries.orderItems())
	const orderCreated = useRef(false)
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

	const currentOrder = orders[0]
	const currentOrderItems = orderItems.filter(
		(item) => item.orderId === currentOrder?.id,
	)
	const totalCents = currentOrderItems.reduce(
		(sum, item) => sum + item.priceCents,
		0,
	)

	useEffect(() => {
		if (orders.length === 0 && !orderCreated.current) {
			orderCreated.current = true
			zero.mutate(mutators.orders.create())
		}
	}, [orders.length, zero])

	function handleAddDish(dishId: number, priceCents: number) {
		if (!currentOrder) return
		zero.mutate(
			mutators.orderItems.add({
				dishId,
				orderId: currentOrder.id,
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

	return (
		<div className="page-wrap py-6 pb-24 lg:pb-6">
			<header className="mb-6 rise-in">
				<h1 className="display-title text-2xl font-bold text-[var(--sea-ink)] tracking-tight">
					Kimchi Train
				</h1>
			</header>

			<div className="flex flex-col lg:flex-row gap-6">
				<section className="flex-1 min-w-0 self-start">
					<div className="divide-y divide-[var(--line)]">
						{dishes.map((dish) => (
							<DishCard
								key={dish.id}
								dish={dish}
								onAdd={() =>
									handleAddDish(dish.id, dish.priceCents)
								}
							/>
						))}
					</div>
				</section>

				<aside className="hidden lg:block w-72 shrink-0">
					<div className="sticky top-4">
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
						className="w-full flex items-center justify-between px-4 py-2.5 island-shell border-t border-[var(--line)] rounded-none"
					>
						<span className="text-xs font-medium text-[var(--sea-ink)]">
							{currentOrderItems.length}{' '}
							{currentOrderItems.length === 1 ? 'item' : 'items'}
						</span>
						<div className="flex items-center gap-2">
							<span className="text-xs font-bold text-[var(--palm)] tabular-nums">
								${(totalCents / 100).toFixed(2)}
							</span>
							<ChevronUp
								size={14}
								className={`text-[var(--sea-ink-soft)] transition-transform ${mobileSheetOpen ? 'rotate-180' : ''}`}
							/>
						</div>
					</button>
				</div>
			)}
		</div>
	)
}
