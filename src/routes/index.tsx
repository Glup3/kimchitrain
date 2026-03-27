import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Plus } from 'lucide-react'
import { ulid } from 'ulid'

import { formatOrderDate } from '#/lib/format'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const zero = useZero()
	const navigate = useNavigate()
	const [orders] = useQuery(queries.orders.all())
	const [orderItems] = useQuery(queries.orderItems.all())

	async function handleCreateOrder() {
		const id = ulid()
		zero.mutate(mutators.orders.createWithId({ id }))
		void navigate({ to: '/train/$orderId', params: { orderId: id } })
	}

	return (
		<>
			<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
				<div className="page-wrap flex items-center justify-between h-14">
					<h1 className="display-title text-lg font-bold text-[var(--sea-ink)] tracking-tight">
						Kimchi Train
					</h1>
					<button
						type="button"
						onClick={handleCreateOrder}
						className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-[var(--lagoon)] text-white border-0 cursor-pointer hover:brightness-110"
					>
						<Plus size={16} strokeWidth={2.5} />
						New Order
					</button>
				</div>
			</nav>

			<div className="page-wrap py-8">
				{orders.length === 0 ? (
					<p className="text-sm text-[var(--sea-ink-soft)] text-center py-16">
						No orders yet
					</p>
				) : (
					<div className="divide-y divide-[var(--line)]">
						{[...orders].reverse().map((order, i) => {
							const num = orders.length - i
							const items = orderItems.filter(
								(item) => item.orderId === order.id,
							)
							const totalCents = items.reduce(
								(sum, item) => sum + item.priceCents,
								0,
							)
							return (
								<Link
									key={order.id}
									to="/train/$orderId"
									params={{ orderId: order.id }}
									className={cn(
										'flex items-center justify-between py-4 no-underline',
										order.completed ? 'opacity-60' : 'text-[var(--sea-ink)]',
									)}
								>
									<div className="flex flex-col gap-0.5">
										<div className="flex items-center gap-3">
											<span className={cn(
												'text-base font-medium',
												order.completed && 'text-[var(--sea-ink-soft)] line-through',
											)}>
												Order #{num}
											</span>
											{order.completed && (
												<span className="flex items-center gap-1 text-xs font-medium text-[var(--lagoon)]">
													<CheckCircle2 size={12} />
													Done
												</span>
											)}
											{!order.completed && (
											<span className="text-sm text-[var(--sea-ink-soft)]">
												{items.length}{' '}
												{items.length === 1 ? 'item' : 'items'}
											</span>
											)}
										</div>
										{order.createdAt != null && (
											<span className="text-xs text-[var(--sea-ink-soft)] opacity-60">
												{formatOrderDate(order.createdAt)}
											</span>
										)}
									</div>
									<span className="text-sm text-[var(--palm)] font-medium tabular-nums">
										€{(totalCents / 100).toFixed(2)}
									</span>
								</Link>
							)
						})}
					</div>
				)}
			</div>
		</>
	)
}
