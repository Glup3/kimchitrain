import { Flame, Plus } from 'lucide-react'

import type { Dish } from '#/db/zero-schema'

interface DishCardProps {
	dish: Dish
	onAdd: () => void
}

export function DishCard({ dish, onAdd }: DishCardProps) {
	return (
		<div className="py-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2 min-w-0">
					<h3 className="text-base font-semibold text-[var(--sea-ink)] leading-tight truncate">
						{dish.name}
					</h3>
					{dish.isPopular && (
						<Flame size={14} className="text-orange-500 shrink-0" />
					)}
					<span className="text-sm text-[var(--palm)] font-medium tabular-nums shrink-0">
						€{(dish.priceCents / 100).toFixed(2)}
					</span>
				</div>
				<button
					type="button"
					onClick={onAdd}
					className="dish-add-btn shrink-0 w-8 h-8 rounded-full bg-[var(--lagoon)] text-white flex items-center justify-center border-0"
				>
					<Plus size={16} strokeWidth={2.5} />
				</button>
			</div>
			<p className="text-sm text-[var(--sea-ink-soft)] leading-relaxed mt-1 line-clamp-2">
				{dish.description}
			</p>
		</div>
	)
}
