import { useQuery } from '@rocicorp/zero/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import OrderRow from '#/components/OrderRow'
import { queries } from '#/lib/queries'

export const Route = createFileRoute('/archive')({ component: Archive })

function Archive() {
	const [orders, result] = useQuery(queries.orders.completedWithItems())

	if (orders.length === 0 && result.type !== 'complete') {
		return (
			<>
				<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
					<div className="mx-auto flex h-14 w-[min(1080px,calc(100%-2rem))] items-center justify-between">
						<Link
							to="/"
							className="flex items-center gap-2 text-sm font-medium text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon)]"
						>
							<ArrowLeft size={16} />
							Back to Orders
						</Link>
						<h1 className="font-['Syne',sans-serif] text-lg font-bold tracking-tight text-[var(--sea-ink)]">Archive</h1>
					</div>
				</nav>
				<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8" />
			</>
		)
	}

	return (
		<>
			<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
				<div className="mx-auto flex h-14 w-[min(1080px,calc(100%-2rem))] items-center justify-between">
					<Link
						to="/"
						className="flex items-center gap-2 text-sm font-medium text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon)]"
					>
						<ArrowLeft size={16} />
						Back to Orders
					</Link>
					<h1 className="font-['Syne',sans-serif] text-lg font-bold tracking-tight text-[var(--sea-ink)]">Archive</h1>
				</div>
			</nav>
			<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8">
				{orders.length === 0 ? (
					<p className="py-16 text-center text-sm text-[var(--sea-ink-soft)]">No completed orders</p>
				) : (
					<div className="divide-y divide-[var(--line)]">
						{orders.map((order) => (
							<OrderRow key={order.id} order={order} />
						))}
					</div>
				)}
			</div>
		</>
	)
}
