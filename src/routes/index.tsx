import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Archive, BarChart3, Plus } from 'lucide-react'
import { ulid } from 'ulid'

import OrderRow from '#/components/OrderRow'
import ThemeToggle from '#/components/ThemeToggle'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'

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
						to="/archive"
						className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--sea-ink)] no-underline hover:bg-[var(--surface-strong)]"
					>
						<Archive size={16} strokeWidth={2.5} />
						Archive
					</Link>
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
	const [openOrders, openResult] = useQuery(queries.orders.openWithItems())
	const [completedOrders, completedResult] = useQuery(queries.orders.recentCompletedWithItems())

	function handleCreateOrder() {
		const id = ulid()
		zero.mutate(mutators.orders.createWithId({ id }))
		void navigate({ to: '/train/$orderId', params: { orderId: id } })
	}

	const loading =
		openOrders.length === 0 &&
		completedOrders.length === 0 &&
		(openResult.type !== 'complete' || completedResult.type !== 'complete')

	if (loading) {
		return (
			<>
				<Nav onCreateOrder={handleCreateOrder} />
				<PageLayout />
			</>
		)
	}

	if (openOrders.length === 0 && completedOrders.length === 0) {
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
				{openOrders.length > 0 && (
					<section>
						<h2 className="mb-2 text-sm font-semibold tracking-wide text-[var(--sea-ink-soft)] uppercase">
							Open Orders
						</h2>
						<div className="divide-y divide-[var(--line)]">
							{openOrders.map((order) => (
								<OrderRow key={order.id} order={order} />
							))}
						</div>
					</section>
				)}
				{completedOrders.length > 0 && (
					<section className={openOrders.length > 0 ? 'mt-8' : ''}>
						<h2 className="mb-2 text-sm font-semibold tracking-wide text-[var(--sea-ink-soft)] uppercase">
							Recently Completed
						</h2>
						<div className="divide-y divide-[var(--line)]">
							{completedOrders.map((order) => (
								<OrderRow key={order.id} order={order} />
							))}
						</div>
						<Link
							to="/archive"
							className="mt-2 block text-center text-sm font-medium text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
						>
							View all completed orders
						</Link>
					</section>
				)}
			</PageLayout>
		</>
	)
}
