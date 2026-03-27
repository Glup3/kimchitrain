import { Minus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { Dish, OrderItem } from '#/db/zero-schema'

function OrdererInput({
	value,
	onCommit,
}: {
	value: string
	onCommit: (v: string) => void
}) {
	const [draft, setDraft] = useState(value)
	const ref = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (document.activeElement !== ref.current) {
			setDraft(value)
		}
	}, [value])

	function commit() {
		if (draft !== value) onCommit(draft)
	}

	return (
		<input
			ref={ref}
			type="text"
			value={draft}
			onChange={(e) => setDraft(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					e.currentTarget.blur()
				}
			}}
			placeholder="Name…"
			className="orderer-input flex-1 min-w-0 text-sm px-2 py-1 rounded bg-transparent border-b border-[var(--line)] text-[var(--sea-ink)] outline-none transition-all"
		/>
	)
}

interface OrderSummaryProps {
	items: OrderItem[]
	dishes: Dish[]
	onRemoveItem: (id: string) => void
	onUpdateOrderer: (id: string, orderer: string) => void
}

export function OrderSummary({
	items,
	dishes,
	onRemoveItem,
	onUpdateOrderer,
}: OrderSummaryProps) {
	const dishMap = new Map(dishes.map((d) => [d.id, d]))
	const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)

	const grouped = items.reduce<
		Map<number, { dish: Dish | undefined; items: OrderItem[] }>
	>((acc, item) => {
		const group = acc.get(item.dishId) ?? {
			dish: dishMap.get(item.dishId),
			items: [],
		}
		group.items.push(item)
		acc.set(item.dishId, group)
		return acc
	}, new Map())

	return (
		<div className="island-shell rounded-xl overflow-hidden">
			<div className="px-5 py-3 border-b border-[var(--line)] flex items-center gap-2">
				<h2 className="text-base font-semibold text-[var(--sea-ink)]">
					Order
				</h2>
				{items.length > 0 && (
					<span className="text-xs font-bold bg-[var(--lagoon)] text-white rounded-full w-5 h-5 flex items-center justify-center leading-none">
						{items.length}
					</span>
				)}
			</div>

			{items.length === 0 ? (
				<p className="px-5 py-8 text-sm text-[var(--sea-ink-soft)] text-center">
					No items yet
				</p>
			) : (
				<div className="divide-y divide-[var(--line)]">
					{[...grouped.values()].map((group) => {
						const qty = group.items.length
						const lineTotal = group.items.reduce(
							(s, i) => s + i.priceCents,
							0,
						)
						return (
							<div key={group.items[0]!.dishId} className="px-5 py-3">
								<div className="flex items-center gap-3">
									<span className="text-lg font-bold text-[var(--lagoon)] tabular-nums w-7 text-center shrink-0">
										{qty}x
									</span>
									<span className="text-sm font-semibold text-[var(--sea-ink)] flex-1 min-w-0 truncate">
										{group.dish?.name ?? 'Unknown'}
									</span>
									<span className="text-sm text-[var(--palm)] tabular-nums shrink-0">
										€{(lineTotal / 100).toFixed(2)}
									</span>
								</div>
								<div className="mt-2 ml-7 flex flex-col gap-1">
									{group.items.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-2"
										>
											<OrdererInput
												value={item.orderer}
												onCommit={(v) =>
													onUpdateOrderer(item.id, v)
												}
											/>
											<button
												type="button"
												onClick={() =>
													onRemoveItem(item.id)
												}
												className="order-remove-btn shrink-0 w-6 h-6 rounded flex items-center justify-center text-[var(--sea-ink-soft)] border-0 bg-transparent"
											>
												<Minus size={14} />
											</button>
										</div>
									))}
								</div>
							</div>
						)
					})}
				</div>
			)}

			{items.length > 0 && (
				<div className="px-5 py-3 border-t border-[var(--line)] flex items-center justify-between">
					<span className="text-sm font-semibold text-[var(--sea-ink)]">
						Total
					</span>
					<span className="text-base text-[var(--palm)] font-bold tabular-nums">
						€{(totalCents / 100).toFixed(2)}
					</span>
				</div>
			)}
		</div>
	)
}
