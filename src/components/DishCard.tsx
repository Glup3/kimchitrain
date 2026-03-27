import { Plus } from 'lucide-react'

import type { Dish } from '#/db/zero-schema'

interface DishCardProps {
	dish: Dish
	onAdd: () => void
}

export function DishCard({ dish, onAdd }: DishCardProps) {
	return (
		<div className="flex items-start justify-between gap-4 py-4">
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-2">
					<h3 className="text-base font-semibold text-[var(--sea-ink)] leading-tight truncate">
						{dish.name}
					</h3>
					<span className="text-sm text-[var(--palm)] font-medium tabular-nums shrink-0">
						${(dish.priceCents / 100).toFixed(2)}
					</span>
				</div>
				<p className="text-sm text-[var(--sea-ink-soft)] leading-relaxed mt-1 line-clamp-2">
					{dish.description}
				</p>
			</div>
			<button
				type="button"
				onClick={onAdd}
				className="dish-add-btn shrink-0 w-9 h-9 rounded-full bg-[var(--lagoon)] text-white flex items-center justify-center border-0 mt-0.5"
			>
				<Plus size={18} strokeWidth={2.5} />
			</button>
		</div>
	)
}
