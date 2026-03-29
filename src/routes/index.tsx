import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BarChart3, CheckCircle2, Plus } from 'lucide-react'
import { ulid } from 'ulid'

import ThemeToggle from '#/components/ThemeToggle'
import { formatOrderDate } from '#/lib/format'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: App })

function Nav({ onCreateOrder }: { onCreateOrder: () => void }) {
	return (
		<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
			<div className="mx-auto flex h-14 w-[min(1080px,calc(100%-2rem))] items-center justify-between">
				<h1 className="font-['Syne',sans-serif] text-lg font-bold tracking-tight text-[var(--sea-ink)]">
					Kimchi Train
				</h1>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<Link
						to="/analytics"
						className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--sea-ink)] no-underline hover:bg-[var(--surface-strong)]"
					>
						<BarChart3 size={16} strokeWidth={2.5} />
						Analytics
					</Link>
					<button
						type="button"
						onClick={onCreateOrder}
						className="flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-[var(--lagoon)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
					>
						<Plus size={16} strokeWidth={2.5} />
						New Order
					</button>
				</div>
			</div>
		</nav>
	)
}

function PageLayout({ children }: { children?: React.ReactNode }) {
	return <div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8">{children}</div>
}

function App() {
	const zero = useZero()
	const navigate = useNavigate()
	const [orders, result] = useQuery(queries.orders.withItems())

	function handleCreateOrder() {
		const id = ulid()
		zero.mutate(mutators.orders.createWithId({ id }))
		void navigate({ to: '/train/$orderId', params: { orderId: id } })
	}

	if (orders.length === 0 && result.type !== 'complete') {
		return (
			<>
				<Nav onCreateOrder={handleCreateOrder} />
				<PageLayout />
			</>
		)
	}

	if (orders.length === 0) {
		return (
			<>
				<Nav onCreateOrder={handleCreateOrder} />
				<PageLayout>
					<p className="py-16 text-center text-sm text-[var(--sea-ink-soft)]">No orders yet</p>
				</PageLayout>
			</>
		)
	}

	return (
		<>
			<Nav onCreateOrder={handleCreateOrder} />
			<PageLayout>
				<div className="divide-y divide-[var(--line)]">
					{[...orders].reverse().map((order) => {
						const totalCents = order.items.reduce((sum, item) => sum + item.priceCents, 0)
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
										<span
											className={cn(
												'text-base font-medium',
												order.completed && 'text-[var(--sea-ink-soft)] line-through',
											)}
										>
											Order {order.id.slice(-8)}
										</span>
										{order.completed && (
											<span className="flex items-center gap-1 text-xs font-medium text-[var(--lagoon)]">
												<CheckCircle2 size={12} />
												Done
											</span>
										)}
										{!order.completed && (
											<span className="text-sm text-[var(--sea-ink-soft)]">
												{order.items.length} {order.items.length === 1 ? 'item' : 'items'}
											</span>
										)}
									</div>
									{order.createdAt != null && (
										<span className="text-xs text-[var(--sea-ink-soft)] opacity-60">
											{formatOrderDate(order.createdAt)}
										</span>
									)}
								</div>
								<span className="text-sm font-medium text-[var(--palm)] tabular-nums">
									€{(totalCents / 100).toFixed(2)}
								</span>
							</Link>
						)
					})}
				</div>
			</PageLayout>
		</>
	)
}
