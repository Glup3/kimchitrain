import { Flame, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DishCard } from '#/components/DishCard'
import type { Dish } from '#/db/zero-schema'
import { cn } from '#/lib/utils'

interface DishWithGroup extends Dish {
	group: { readonly id: number; readonly name: string } | undefined
}

interface DishMenuProps {
	dishes: readonly DishWithGroup[]
	disabled: boolean
	onAddDish: (dishId: number, priceCents: number) => void
}

export function DishMenu({ dishes, disabled, onAddDish }: DishMenuProps) {
	const [query, setQuery] = useState('')

	const filtered = useMemo(() => {
		if (!query.trim()) return dishes
		const q = query.toLowerCase()
		return dishes.filter(
			(d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.group?.name.toLowerCase().includes(q),
		)
	}, [dishes, query])

	const grouped = filtered.reduce<Map<number, readonly DishWithGroup[]>>((acc, d) => {
		const list = acc.get(d.groupId) ?? []
		acc.set(d.groupId, [...list, d])
		return acc
	}, new Map())

	return (
		<section className="min-w-0 flex-1">
			<div className="mb-4 flex items-center gap-1.5 text-xs text-(--sea-ink-soft)">
				<Flame size={13} className="text-orange-500" />
				<span>Popular</span>
			</div>
			<div className="relative mb-4">
				<Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--sea-ink-soft)" />
				<input
					type="text"
					placeholder="Search dishes…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-full rounded-lg border border-(--line) bg-(--surface-strong) py-2 pr-8 pl-8 text-sm text-[var(--sea-ink)] outline-none placeholder:text-(--sea-ink-soft) focus:border-(--lagoon) focus:ring-1 focus:ring-(--lagoon)"
				/>
				{query && (
					<button
						type="button"
						onClick={() => setQuery('')}
						className={cn(
							'absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full border-0 p-0.5 text-(--sea-ink-soft) hover:text-(--sea-ink)',
						)}
					>
						<X size={14} />
					</button>
				)}
			</div>
			{[...grouped.entries()].map(([groupId, groupDishes]) => (
				<div key={groupId} className="mb-6" data-tour={`dish-menu-${groupId}`}>
					<h2 className="mb-2 text-[0.69rem] font-bold tracking-[0.16em] text-(--kicker) uppercase">
						{groupDishes[0]?.group?.name ?? 'Other'}
					</h2>
					<div className="divide-y divide-(--line)">
						{groupDishes.map((dish) => (
							<DishCard
								key={dish.id}
								dish={dish}
								disabled={disabled}
								onAdd={() => onAddDish(dish.id, dish.priceCents)}
							/>
						))}
					</div>
				</div>
			))}
			{grouped.size === 0 && (
				<p className="py-8 text-center text-sm text-(--sea-ink-soft)">No dishes found for "{query}"</p>
			)}
		</section>
	)
}
