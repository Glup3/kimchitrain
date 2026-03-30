import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import type { EnrichedOrderItem } from '#/components/OrderSummary'
import { OrderSummary } from '#/components/OrderSummary'
import { cn } from '#/lib/utils'

interface MobileOrderSummaryProps {
	items: readonly EnrichedOrderItem[]
	totalCents: number
	onRemoveItem: (id: string) => void
	onUpdateOrderer: (id: string, orderer: string) => void
	readOnly: boolean
}

export function MobileOrderSummary({ items, totalCents, ...summaryRest }: MobileOrderSummaryProps) {
	const [open, setOpen] = useState(false)

	if (items.length === 0) return null

	return (
		<div data-tour="order-summary" className="lg:hidden">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px)]"
			>
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-[var(--sea-ink)]">Order</span>
					<span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs leading-none font-bold text-white">
						{items.length}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm font-bold text-[var(--palm)] tabular-nums">€{(totalCents / 100).toFixed(2)}</span>
					<ChevronDown size={18} className={cn('text-(--sea-ink-soft) transition-transform', open && 'rotate-180')} />
				</div>
			</button>
			{open && (
				<div className="mt-2">
					<OrderSummary items={items} {...summaryRest} />
				</div>
			)}
		</div>
	)
}
