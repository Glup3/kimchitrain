import { Link } from '@tanstack/react-router'
import { CheckCircle2, Clock } from 'lucide-react'

import { formatOrderDate } from '#/lib/format'
import { cn } from '#/lib/utils'

export type OrderRowProps = {
	id: string
	completed: boolean
	createdAt: number | null
	items: readonly { priceCents: number; orderer: string; settled: boolean }[]
}

export default function OrderRow({ order }: { order: OrderRowProps }) {
	const totalCents = order.items.reduce((sum, item) => sum + item.priceCents, 0)
	const unsettledCents = order.items.filter((item) => !item.settled).reduce((sum, item) => sum + item.priceCents, 0)
	const allSettled = order.completed && unsettledCents === 0
	const orderers = [...new Set(order.items.map((item) => item.orderer))]
	return (
		<Link
			to="/train/$orderId"
			params={{ orderId: order.id }}
			className={cn(
				'flex items-center justify-between py-4 no-underline',
				order.completed && !allSettled && 'opacity-60',
				allSettled && 'opacity-40',
				!order.completed && 'text-[var(--sea-ink)]',
			)}
		>
			<div className="flex flex-col gap-0.5">
				<div className="flex items-center gap-3">
					<span className={cn('text-base font-medium', order.completed && 'text-[var(--sea-ink-soft)] line-through')}>
						Order {order.id.slice(-8)}
					</span>
					{allSettled && (
						<span className="flex items-center gap-1 text-xs font-medium text-[var(--lagoon)]">
							<CheckCircle2 size={12} />
							Settled
						</span>
					)}
					{order.completed && !allSettled && (
						<span className="flex items-center gap-1 text-xs font-medium text-[var(--palm)]">
							<CheckCircle2 size={12} />
							Done
						</span>
					)}
					{!order.completed && (
						<span className="flex items-center gap-1 text-sm text-[var(--sea-ink-soft)]">
							<Clock size={12} />
							{order.items.length} {order.items.length === 1 ? 'item' : 'items'}
						</span>
					)}
				</div>
				{order.createdAt != null && (
					<span className="text-xs text-[var(--sea-ink-soft)] opacity-60">{formatOrderDate(order.createdAt)}</span>
				)}
				{orderers.length > 0 && <span className="text-xs text-[var(--sea-ink-soft)]">{orderers.join(', ')}</span>}
			</div>
			<div className="flex flex-col items-end gap-0.5">
				<span className="text-sm font-medium text-[var(--palm)] tabular-nums">€{(totalCents / 100).toFixed(2)}</span>
				{order.completed && unsettledCents > 0 && (
					<span className="text-xs font-medium text-[var(--sea-ink-soft)] tabular-nums">
						€{(unsettledCents / 100).toFixed(2)} owed
					</span>
				)}
			</div>
		</Link>
	)
}
