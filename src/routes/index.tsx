import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { ulid } from 'ulid'

import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const zero = useZero()
	const navigate = useNavigate()
	const [orders] = useQuery(queries.orders())
	const [orderItems] = useQuery(queries.orderItems())

	async function handleCreateOrder() {
		const id = ulid()
		zero.mutate(mutators.orders.createWithId({ id }))
		void navigate({ to: '/train/$orderId', params: { orderId: id } })
	}

	return (
		<>
			<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
				<div className="page-wrap flex items-center justify-between h-11">
					<h1 className="display-title text-base font-bold text-[var(--sea-ink)] tracking-tight">
						Kimchi Train
					</h1>
					<button
						type="button"
						onClick={handleCreateOrder}
						className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--lagoon)] text-white border-0 cursor-pointer hover:brightness-110"
					>
						<Plus size={13} strokeWidth={2.5} />
						New Order
					</button>
				</div>
			</nav>

			<div className="page-wrap py-6">
				{orders.length === 0 ? (
					<p className="text-xs text-[var(--sea-ink-soft)] text-center py-12">
						No orders yet
					</p>
				) : (
					<div className="divide-y divide-[var(--line)]">
						{[...orders].reverse().map((order) => {
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
									className="flex items-center justify-between py-3 text-[var(--sea-ink)] no-underline"
								>
									<div className="flex items-center gap-3">
										<span className="text-sm font-medium">
											Order {order.id.slice(-5)}
										</span>
										<span className="text-xs text-[var(--sea-ink-soft)]">
											{items.length}{' '}
											{items.length === 1 ? 'item' : 'items'}
										</span>
									</div>
									<span className="text-xs text-[var(--palm)] font-medium tabular-nums">
										${(totalCents / 100).toFixed(2)}
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
