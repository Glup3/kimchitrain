import { Check, Copy, Minus, User } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { OrderShareCard } from '#/components/OrderShareCard'
import type { Dish, OrderItem } from '#/db/zero-schema'
import { useShareImage } from '#/hooks/useShareImage'
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
	createdAt: number | null
	onRemoveItem: (id: string) => void
	onUpdateOrderer: (id: string, orderer: string) => void
	onSettleItem: (id: string, settled: boolean) => void
	readOnly?: boolean
}

export function OrderSummary({
	items,
	createdAt,
	onRemoveItem,
	onUpdateOrderer,
	onSettleItem,
	readOnly,
}: OrderSummaryProps) {
	const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)
	const prevCountRef = useRef(items.length)
	const [countBumped, setCountBumped] = useState(false)
	const { shareRef, copyImage, copied } = useShareImage()

	useEffect(() => {
		if (items.length !== prevCountRef.current) {
			prevCountRef.current = items.length
			setCountBumped(true)
			const id = setTimeout(() => setCountBumped(false), 300)
			return () => clearTimeout(id)
		}
	}, [items.length])

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
					<span
						key={items.length}
						className={cn(
							'flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs leading-none font-bold text-white',
							countBumped && 'animate-[bounce-badge_0.3s_ease]',
						)}
					>
						{items.length}
					</span>
				)}
			</div>

			{items.length === 0 ? (
				<p className="px-5 py-8 text-center text-sm text-[var(--sea-ink-soft)]">No items yet</p>
			) : (
				<div className="min-h-0 flex-1 divide-y divide-[var(--line)] overflow-y-auto">
					{[...grouped.values()].map((group, gi) => {
						const qty = group.items.length
						const lineTotal = group.items.reduce((s, i) => s + i.priceCents, 0)
						return (
							<div
								key={group.items[0]!.dishId}
								className="animate-[slide-in-row_0.25s_ease_both] px-5 py-3"
								style={{ animationDelay: `${gi * 40}ms` }}
							>
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
					<PersonBreakdown items={items} onSettleItem={onSettleItem} readOnly={readOnly} />
					<div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3">
						<span className="text-sm font-semibold text-[var(--sea-ink)]">Total</span>
						<span className="text-base font-bold text-[var(--palm)] tabular-nums">
							€{(totalCents / 100).toFixed(2)}
						</span>
					</div>
					{readOnly && (
						<div className="border-t border-[var(--line)] px-5 py-3">
							<button
								type="button"
								onClick={() => void copyImage()}
								className={cn(
									'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
									copied
										? 'border-[var(--lagoon)] bg-[var(--lagoon)] text-white'
										: 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]',
								)}
							>
								<Copy size={14} />
								{copied ? 'Copied!' : 'Copy as image'}
							</button>
						</div>
					)}
				</div>
			)}

			{readOnly && items.length > 0 && <OrderShareCard ref={shareRef} items={items} createdAt={createdAt} />}
		</div>
	)
}

function PersonBreakdown({
	items,
	onSettleItem,
	readOnly,
}: {
	items: readonly EnrichedOrderItem[]
	onSettleItem: (id: string, settled: boolean) => void
	readOnly?: boolean
}) {
	const perPerson = useMemo(() => {
		const map = new Map<string, { cents: number; settledCents: number; itemIds: string[] }>()
		for (const item of items) {
			const name = item.orderer.trim() || 'Unassigned'
			const entry = map.get(name) ?? { cents: 0, settledCents: 0, itemIds: [] as string[] }
			entry.cents += item.priceCents
			if (item.settled) entry.settledCents += item.priceCents
			entry.itemIds.push(item.id)
			map.set(name, entry)
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
	}, [items])

	if (perPerson.length < 2 && !readOnly) return null

	const allSettled = perPerson.every(([, entry]) => entry.settledCents === entry.cents)

	return (
		<div className="border-t border-[var(--line)] px-5 py-3">
			<h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--sea-ink-soft)] uppercase">
				{readOnly ? 'Payment tracking' : 'Per person'}
			</h3>
			<div className="flex flex-col gap-1.5">
				{perPerson.map(([name, entry]) => {
					const isFullySettled = entry.settledCents === entry.cents
					return (
						<div key={name} className="flex items-center justify-between gap-2">
							<span className="flex items-center gap-1.5 text-sm text-[var(--sea-ink)]">
								<User size={13} className="text-[var(--sea-ink-soft)]" />
								{name}
							</span>
							<div className="flex items-center gap-2">
								<span
									className={cn(
										'text-sm tabular-nums',
										isFullySettled
											? 'font-medium text-[var(--sea-ink-soft)] line-through'
											: 'font-medium text-[var(--palm)]',
									)}
								>
									€{(entry.cents / 100).toFixed(2)}
								</span>
								{readOnly && (
									<button
										type="button"
										onClick={() => {
											const nextSettled = !isFullySettled
											for (const id of entry.itemIds) {
												onSettleItem(id, nextSettled)
											}
										}}
										className={cn(
											'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all',
											isFullySettled
												? 'border-[var(--lagoon)] bg-[var(--lagoon)] text-white'
												: 'border-[var(--line)] bg-transparent text-transparent hover:border-[var(--lagoon)] hover:text-[var(--lagoon)]',
										)}
									>
										<Check size={12} strokeWidth={3} />
									</button>
								)}
							</div>
						</div>
					)
				})}
			</div>
			{readOnly && !allSettled && (
				<div className="mt-2 flex items-center justify-between border-t border-dashed border-[var(--line)] pt-2">
					<span className="text-xs font-medium text-[var(--sea-ink-soft)]">Outstanding</span>
					<span className="text-sm font-bold text-[var(--palm)] tabular-nums">
						€{(perPerson.reduce((sum, [, e]) => sum + e.cents - e.settledCents, 0) / 100).toFixed(2)}
					</span>
				</div>
			)}
			{readOnly && allSettled && (
				<div className="mt-2 flex items-center gap-1.5 border-t border-dashed border-[var(--line)] pt-2">
					<Check size={13} className="text-[var(--lagoon)]" />
					<span className="text-xs font-medium text-[var(--lagoon)]">All settled up</span>
				</div>
			)}
		</div>
	)
}
