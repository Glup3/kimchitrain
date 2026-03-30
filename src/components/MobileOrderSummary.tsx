import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { EnrichedOrderItem } from '#/components/OrderSummary'
import { OrderSummary } from '#/components/OrderSummary'
import { cn } from '#/lib/utils'

interface MobileOrderSummaryProps {
	items: readonly EnrichedOrderItem[]
	totalCents: number
	onRemoveItem: (id: string) => void
	onUpdateOrderer: (id: string, orderer: string) => void
	onSettleItem: (id: string, settled: boolean) => void
	readOnly: boolean
}

export function MobileOrderSummary({ items, totalCents, ...summaryRest }: MobileOrderSummaryProps) {
	const [open, setOpen] = useState(false)
	const hasItems = items.length > 0
	const prevCountRef = useRef(items.length)
	const [countBumped, setCountBumped] = useState(false)

	useEffect(() => {
		if (items.length !== prevCountRef.current) {
			prevCountRef.current = items.length
			setCountBumped(true)
			const id = setTimeout(() => setCountBumped(false), 300)
			return () => clearTimeout(id)
		}
	}, [items.length])

	return (
		<div className="md:hidden">
			{hasItems && (
				<>
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						className="backdrop-blur-[4px)] flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
					>
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-[var(--sea-ink)]">Order</span>
							<span
								className={cn(
									'flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs leading-none font-bold text-white',
									countBumped && 'animate-[bounce-badge_0.3s_ease]',
								)}
							>
								{items.length}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-sm font-bold text-[var(--palm)] tabular-nums">
								€{(totalCents / 100).toFixed(2)}
							</span>
							<ChevronDown
								size={18}
								className={cn('text-(--sea-ink-soft) transition-transform', open && 'rotate-180')}
							/>
						</div>
					</button>
					{open && (
						<div className="mt-2">
							<OrderSummary items={items} {...summaryRest} />
						</div>
					)}
				</>
			)}
			{!hasItems && (
				<div className="rounded-xl border border-dashed border-[var(--line)] px-5 py-3 text-center text-sm text-[var(--sea-ink-soft)]">
					No items yet
				</div>
			)}
		</div>
	)
}
