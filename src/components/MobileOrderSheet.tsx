import { ChevronUp } from 'lucide-react'
import { useState } from 'react'

import type { EnrichedOrderItem } from '#/components/OrderSummary'
import { OrderSummary } from '#/components/OrderSummary'
import { cn } from '#/lib/utils'

interface MobileOrderSheetProps {
	items: readonly EnrichedOrderItem[]
	totalCents: number
	onRemoveItem: (id: string) => void
	onUpdateOrderer: (id: string, orderer: string) => void
	readOnly: boolean
}

export function MobileOrderSheet({ items, totalCents, ...summaryRest }: MobileOrderSheetProps) {
	const [open, setOpen] = useState(false)

	if (items.length === 0) return null

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 animate-[rise-in_400ms_cubic-bezier(0.16,1,0.3,1)_both] lg:hidden">
			{open && (
				<div className="max-h-[55vh] overflow-y-auto rounded-t-xl">
					<OrderSummary items={items} {...summaryRest} />
				</div>
			)}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between rounded-none border border-t border-(--line) bg-(--surface-strong) px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xs"
			>
				<span className="text-sm font-medium text-(--sea-ink)">
					{items.length} {items.length === 1 ? 'item' : 'items'}
				</span>
				<div className="flex items-center gap-3">
					<span className="text-sm font-bold text-(--palm) tabular-nums">€{(totalCents / 100).toFixed(2)}</span>
					<ChevronUp size={18} className={cn('text-(--sea-ink-soft) transition-transform', open && 'rotate-180')} />
				</div>
			</button>
		</div>
	)
}
