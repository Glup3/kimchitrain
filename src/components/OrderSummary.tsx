import { Trash2 } from 'lucide-react'

import type { Dish, OrderItem } from '#/db/zero-schema'

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

	return (
		<div className="island-shell rounded-xl overflow-hidden">
			<div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center gap-2">
				<h2 className="text-sm font-semibold text-[var(--sea-ink)]">
					Order
				</h2>
				{items.length > 0 && (
					<span className="text-[0.65rem] font-bold bg-[var(--lagoon)] text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
						{items.length}
					</span>
				)}
			</div>

			{items.length === 0 ? (
				<p className="px-4 py-6 text-xs text-[var(--sea-ink-soft)] text-center">
					No items yet
				</p>
			) : (
				<div className="divide-y divide-[var(--line)]">
					{items.map((item, i) => {
						const dish = dishMap.get(item.dishId)
						return (
							<div
								key={item.id}
								className="order-item-row px-4 py-2.5 flex items-center gap-2"
								style={{ animationDelay: `${i * 30}ms` }}
							>
								<div className="flex-1 min-w-0 flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<span className="text-xs font-medium text-[var(--sea-ink)] truncate">
											{dish?.name ?? 'Unknown'}
										</span>
										<span className="text-xs text-[var(--palm)] tabular-nums shrink-0">
											${(item.priceCents / 100).toFixed(2)}
										</span>
									</div>
									<input
										type="text"
										value={item.orderer}
										onChange={(e) =>
											onUpdateOrderer(item.id, e.target.value)
										}
										placeholder="Name…"
										className="orderer-input w-full text-[0.68rem] px-2 py-0.5 rounded bg-transparent border-b border-[var(--line)] text-[var(--sea-ink)] outline-none transition-all"
									/>
								</div>
								<button
									type="button"
									onClick={() => onRemoveItem(item.id)}
									className="order-remove-btn shrink-0 w-5 h-5 rounded flex items-center justify-center text-[var(--sea-ink-soft)] border-0 bg-transparent"
								>
									<Trash2 size={11} />
								</button>
							</div>
						)
					})}
				</div>
			)}

			{items.length > 0 && (
				<div className="px-4 py-2 border-t border-[var(--line)] flex items-center justify-between">
					<span className="text-xs font-semibold text-[var(--sea-ink)]">
						Total
					</span>
					<span className="text-sm text-[var(--palm)] font-bold tabular-nums">
						${(totalCents / 100).toFixed(2)}
					</span>
				</div>
			)}
		</div>
	)
}
