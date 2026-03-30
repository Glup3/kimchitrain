import { Minus, User } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { Dish, OrderItem } from '#/db/zero-schema'
import { cn } from '#/lib/utils'

function OrdererInput({
	value,
	onCommit,
	readOnly,
}: {
	value: string
	onCommit: (v: string) => void
	readOnly?: boolean
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
			disabled={readOnly}
			className={cn(
				'flex-1 min-w-0 text-sm px-2 py-1 rounded bg-transparent border-b border-[var(--line)] text-[var(--sea-ink)] outline-none transition-all placeholder:opacity-50 placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:shadow-[0_0_0_2px_rgba(220,38,38,0.15)]',
				readOnly && 'opacity-60 cursor-default border-transparent',
			)}
		/>
	)
}

export type EnrichedOrderItem = Readonly<OrderItem> & { readonly dish: Dish | undefined }

interface OrderSummaryProps {
	items: readonly EnrichedOrderItem[]
	onRemoveItem: (id: string) => void
	onUpdateOrderer: (id: string, orderer: string) => void
	readOnly?: boolean
}

export function OrderSummary({ items, onRemoveItem, onUpdateOrderer, readOnly }: OrderSummaryProps) {
	const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)

	const grouped = items.reduce<Map<number, { dish: Dish | undefined; items: EnrichedOrderItem[] }>>((acc, item) => {
		const group = acc.get(item.dishId) ?? {
			dish: item.dish,
			items: [] as EnrichedOrderItem[],
		}
		group.items.push(item)
		acc.set(item.dishId, group)
		return acc
	}, new Map())

	return (
		<div className="flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]">
			<div className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] px-5 py-3">
				<h2 className="text-base font-semibold text-[var(--sea-ink)]">Order</h2>
				{items.length > 0 && (
					<span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs leading-none font-bold text-white">
						{items.length}
					</span>
				)}
			</div>

			{items.length === 0 ? (
				<p className="px-5 py-8 text-center text-sm text-[var(--sea-ink-soft)]">No items yet</p>
			) : (
				<div className="min-h-0 flex-1 divide-y divide-[var(--line)] overflow-y-auto">
					{[...grouped.values()].map((group) => {
						const qty = group.items.length
						const lineTotal = group.items.reduce((s, i) => s + i.priceCents, 0)
						return (
							<div key={group.items[0]!.dishId} className="px-5 py-3">
								<div className="flex items-center gap-3">
									<span className="w-7 shrink-0 text-center text-lg font-bold text-[var(--lagoon)] tabular-nums">
										{qty}x
									</span>
									<span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--sea-ink)]">
										{group.dish?.name ?? 'Unknown'}
									</span>
									<span className="shrink-0 text-sm text-[var(--palm)] tabular-nums">
										€{(lineTotal / 100).toFixed(2)}
									</span>
								</div>
								<div className="mt-2 ml-7 flex flex-col gap-1">
									{group.items.map((item) => (
										<div key={item.id} className="flex items-center gap-2">
											<OrdererInput
												value={item.orderer}
												onCommit={(v) => onUpdateOrderer(item.id, v)}
												readOnly={readOnly}
											/>
											{!readOnly && (
												<button
													type="button"
													onClick={() => onRemoveItem(item.id)}
													className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--sea-ink-soft)] transition-colors hover:bg-[rgba(229,62,62,0.08)] hover:text-[#e53e3e]"
												>
													<Minus size={14} />
												</button>
											)}
										</div>
									))}
								</div>
							</div>
						)
					})}
				</div>
			)}

			{items.length > 0 && (
				<div className="shrink-0">
					<PersonBreakdown items={items} />
					<div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3">
						<span className="text-sm font-semibold text-[var(--sea-ink)]">Total</span>
						<span className="text-base font-bold text-[var(--palm)] tabular-nums">
							€{(totalCents / 100).toFixed(2)}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

function PersonBreakdown({ items }: { items: readonly EnrichedOrderItem[] }) {
	const perPerson = useMemo(() => {
		const map = new Map<string, number>()
		for (const item of items) {
			const name = item.orderer.trim() || 'Unassigned'
			map.set(name, (map.get(name) ?? 0) + item.priceCents)
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
	}, [items])

	if (perPerson.length < 2) return null

	return (
		<div className="border-t border-[var(--line)] px-5 py-3">
			<h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--sea-ink-soft)] uppercase">Per person</h3>
			<div className="flex flex-col gap-1.5">
				{perPerson.map(([name, cents]) => (
					<div key={name} className="flex items-center justify-between">
						<span className="flex items-center gap-1.5 text-sm text-[var(--sea-ink)]">
							<User size={13} className="text-[var(--sea-ink-soft)]" />
							{name}
						</span>
						<span className="text-sm font-medium text-[var(--palm)] tabular-nums">€{(cents / 100).toFixed(2)}</span>
					</div>
				))}
			</div>
		</div>
	)
}
